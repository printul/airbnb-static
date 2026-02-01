# Project Decisions & Context

Persistent log of architecture decisions, conventions, and project context so nothing gets lost between sessions.

---

## Project Overview

- **Game**: "Lonely Penguin" — a single-file browser game (index.html) where a penguin travels 75km across Antarctic ice
- **Owner**: Synquire Ltd (proprietary, 2025-2026)
- **Tech stack**: Pure HTML5/CSS3/vanilla JS, HTML5 Canvas, Web Audio API — no frameworks, no build step
- **Serving**: `npx serve -l 3000`
- **Repo branch**: `claude/lonely-penguin-game-O3MvB`

---

## Architecture Decisions

### AD-001: Global Scoreboard Backend — Cloudflare Workers + KV
- **Date**: 2026-02-01
- **Status**: Approved
- **Context**: Game currently uses localStorage for leaderboard (browser-only, not shared). Need a global scoreboard so all players see the same leaderboard.
- **Decision**: Use Cloudflare Workers + KV storage.
- **Rationale**:
  - User already has a Cloudflare account set up
  - Minimal complexity — just 2 endpoints (GET /scores, POST /scores)
  - Free tier is generous (100K reads/day, 1K writes/day)
  - KV is globally replicated at edge = fast reads everywhere
  - Simple sorted-list data model maps perfectly to KV
  - Alternatives considered:
    - **Workers + D1**: Overkill — don't need SQL queries for a simple leaderboard
    - **Workers + Durable Objects**: Paid only, meant for real-time multiplayer coordination
- **Resolved questions**:
  - ~~Keep localStorage as offline fallback?~~ **No** — offline play removed; leaderboard is server-only
  - ~~Any anti-cheat / server-side score validation?~~ **Yes** — HMAC-SHA256 token + timing + range checks (see AD-002)
  - ~~Cloudflare subdomain / Worker URL?~~ Placeholder in code (`WORKER_URL`), user to fill in after Worker deployment

### AD-002: Anti-Cheat — HMAC + Server Validation
- **Date**: 2026-02-01
- **Status**: Implemented
- **Context**: Scores stored client-side were trivially editable. Need server-side validation.
- **Decision**: Multi-layer anti-cheat via Cloudflare Worker:
  1. **HMAC-SHA256 token** — client signs `distance:friends:duration` with shared secret; Worker verifies
  2. **Timing check** — game tracks wall-clock play duration; Worker rejects impossibly fast completions (< 4 min)
  3. **Speed sanity** — distance cannot exceed `maxSpeed * duration` (with 15% tolerance)
  4. **Range validation** — distance 0–75 km, friends 0–500, name ≤ 15 chars
  5. **Server-side sanitization** — name stripped of HTML chars on both client and server
- **Limitations** (acceptable for this game):
  - Shared secret is in client JS — a determined attacker could extract it. This blocks casual cheating via DevTools/localStorage editing.
  - No replay protection (same token could be resubmitted). Acceptable since KV deduplication is not critical for a fun leaderboard.
- **Files**: `worker.js` (Cloudflare Worker), `index.html` (client API calls)

---

## Conventions

- Single-file game: all game code lives in `index.html`
- No external dependencies — keep it self-contained
- Proprietary license — Synquire Ltd
- XSS sanitization on player name input (already implemented)

---

## TODO / Upcoming

- ~~Implement Cloudflare Worker for global scoreboard API~~ Done (`worker.js`)
- ~~Update index.html to call Worker API instead of localStorage~~ Done
- Create KV namespace `PENGUIN_LEADERBOARD` in Cloudflare dashboard
- Deploy Worker (paste `worker.js` or use wrangler)
- Bind KV namespace as `LEADERBOARD` variable in Worker settings
- Set `SCORE_SECRET` environment variable in Worker settings (and update client `SCORE_SECRET` to match)
- Set `WORKER_URL` in `index.html` to the deployed Worker URL

---

## Session Log

### 2026-02-01
- Discussed global scoreboard options
- Decided on Cloudflare Workers + KV (AD-001)
- Removed localStorage offline play — leaderboard is now server-only
- Implemented anti-cheat with HMAC-SHA256 + timing + range validation (AD-002)
- Created `worker.js` — ready to deploy to Cloudflare
- Updated `index.html` — `saveScore`/`saveWinScore`/`showLeaderboard` now use fetch API
- Awaiting: Worker deployment, KV namespace creation, WORKER_URL configuration
