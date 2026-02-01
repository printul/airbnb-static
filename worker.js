/**
 * Lonely Penguin — Global Leaderboard Worker
 * Copyright (c) Synquire Ltd, 2025-2026. All rights reserved.
 *
 * Cloudflare Worker + KV backend with server-side anti-cheat validation.
 *
 * KV binding required: LEADERBOARD
 *   - Key "scores" → JSON array of top 100 score entries
 *
 * Endpoints:
 *   GET  /api/scores          → returns top 100 scores
 *   POST /api/scores          → submit a new score (validated)
 *   OPTIONS /api/scores       → CORS preflight
 *
 * Deploy:
 *   1. Create KV namespace "PENGUIN_LEADERBOARD"
 *   2. Bind it as variable LEADERBOARD in Worker settings
 *   3. Paste this file into the Worker editor (or use wrangler)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Game constants (must match client CONFIG) ───────────────────────
const GAME = {
  goalDistance: 75,          // km
  baseSpeed: 4.5,           // km/h
  maxSpeed: 12,             // km/h (theoretical max at 100/100)
  distancePerFrame: 0.002,  // km per frame at base speed
  // At max speed the fastest possible completion ≈ 75 / (0.002 * (12/4.5) * 60) ≈ 4.6 min
  minGameSeconds: 240,      // 4 min — generous floor
  maxDistanceKm: 75,
  maxFriends: 500,          // sanity cap
  maxNameLength: 15,
};

const MAX_LEADERBOARD = 100;

// ── Helpers ─────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function err(message, status = 400) {
  return json({ error: message }, status);
}

/** Basic anti-cheat checks — returns null if valid, error string if not. */
function validateScore(body) {
  const { name, distance, friends, completed, duration, token } = body;

  // Required fields
  if (typeof name !== 'string' || name.length === 0)
    return 'Missing name';
  if (typeof distance !== 'number' || isNaN(distance))
    return 'Invalid distance';
  if (typeof friends !== 'number' || isNaN(friends))
    return 'Invalid friends';
  if (typeof duration !== 'number' || isNaN(duration))
    return 'Invalid duration';
  if (typeof token !== 'string' || token.length === 0)
    return 'Missing token';

  // ── Value range checks ──
  if (distance < 0 || distance > GAME.maxDistanceKm)
    return 'Distance out of range';
  if (friends < 0 || friends > GAME.maxFriends)
    return 'Friends out of range';
  if (completed && distance < GAME.goalDistance)
    return 'Completed flag inconsistent with distance';

  // ── Timing check ──
  // duration is seconds the game ran (client-tracked wall clock)
  if (duration < GAME.minGameSeconds)
    return 'Played too fast';

  // Speed sanity — at absolute max speed (12 km/h) the theoretical
  // distance in the reported time can't exceed maxSpeed * hours.
  const maxPossibleKm = GAME.maxSpeed * (duration / 3600);
  if (distance > maxPossibleKm * 1.15) // 15% tolerance for timing jitter
    return 'Distance impossible for play duration';

  // ── Token check (HMAC-SHA256) ──
  // Token is validated asynchronously in the handler (crypto.subtle is async)
  // so we just confirm it's present here.

  return null; // valid
}

/** Derive expected HMAC token for a score payload. */
async function computeToken(distance, friends, duration, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const msg = `${distance}:${friends}:${duration}`;
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(msg));
  return [...new Uint8Array(sig)]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Main handler ────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only handle /api/scores
    if (url.pathname !== '/api/scores') {
      return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    }

    // ── GET: return leaderboard ──
    if (request.method === 'GET') {
      const raw = await env.LEADERBOARD.get('scores');
      const scores = raw ? JSON.parse(raw) : [];
      return json({ scores });
    }

    // ── POST: submit score ──
    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return err('Invalid JSON');
      }

      // Structural + range validation
      const problem = validateScore(body);
      if (problem) return err(problem);

      // HMAC token verification
      const secret = env.SCORE_SECRET || 'penguin-default-secret';
      const expected = await computeToken(
        body.distance, body.friends, body.duration, secret
      );
      if (body.token !== expected) {
        return err('Invalid token');
      }

      // Sanitize name (server side, same rules as client)
      const sanitizedName = body.name
        .substring(0, GAME.maxNameLength)
        .replace(/[<>"'&]/g, '');

      const entry = {
        name: sanitizedName || 'Anonymous',
        distance: Math.round(body.distance * 100) / 100,
        friends: Math.floor(body.friends),
        completed: !!body.completed,
        date: new Date().toISOString(),
      };

      // Read current leaderboard, insert, sort, trim
      const raw = await env.LEADERBOARD.get('scores');
      const scores = raw ? JSON.parse(raw) : [];
      scores.push(entry);
      scores.sort((a, b) => b.distance - a.distance);
      const trimmed = scores.slice(0, MAX_LEADERBOARD);
      await env.LEADERBOARD.put('scores', JSON.stringify(trimmed));

      // Return rank
      const rank = trimmed.findIndex(
        e => e.name === entry.name && e.date === entry.date
      );

      return json({ rank, entry, total: trimmed.length });
    }

    return err('Method not allowed', 405);
  }
};
