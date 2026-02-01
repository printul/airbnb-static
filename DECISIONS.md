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
- **Open questions** (need user input):
  - [ ] Keep localStorage as offline fallback?
  - [ ] Any anti-cheat / server-side score validation?
  - [ ] Cloudflare subdomain / Worker URL (or use placeholder for now?)

---

## Conventions

- Single-file game: all game code lives in `index.html`
- No external dependencies — keep it self-contained
- Proprietary license — Synquire Ltd
- XSS sanitization on player name input (already implemented)

---

## TODO / Upcoming

- Implement Cloudflare Worker for global scoreboard API
- Create KV namespace for leaderboard storage
- Update index.html to call Worker API instead of localStorage
- Deploy Worker to Cloudflare

---

## Session Log

### 2026-02-01
- Discussed global scoreboard options
- Decided on Cloudflare Workers + KV (AD-001)
- Awaiting answers on fallback, anti-cheat, and subdomain before implementation
