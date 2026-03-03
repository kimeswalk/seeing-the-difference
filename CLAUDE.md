# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test or lint tooling is configured.

## Architecture

Single-page React app (Vite) with all logic in **`App.jsx`**. There is no routing, no component separation beyond the top-level `App`, and no state management library.

**Data flow:**
1. User enters a topic + student word associations + a word count slider value
2. `generate()` calls the Anthropic Claude API (`claude-haiku-4-5-20251001`) requesting ~N associated words scored 1–100 by frequency
3. The API response (JSON array `[{word, score}]`) is parsed and passed to `renderVisualization()`
4. `renderVisualization()` draws everything onto a `<canvas>` element (900×1100px) using the Canvas 2D API — no external visualization library

**Canvas rendering pipeline** (all in `App.jsx`):
- `drawOpalPearl()` — draws a layered gradient "pearl" at center with the topic's primary student word
- Student associations are placed in concentric rings around the pearl
- AI field words are scattered in the outer area using a seeded LCG pseudo-random placer with collision detection (`anyOverlap()`)
- Word size and color are driven by normalized score via `fieldColor()` (HSL)
- Final canvas can be exported as PNG via `download()`

**API key:** Stored in `.env` as `VITE_ANTHROPIC_API_KEY`. Copy `.env.example` to `.env` and fill in the key. Never commit `.env` (it's in `.gitignore`).

**Browser API access:** The fetch includes `"anthropic-dangerous-direct-browser-access": "true"` — required because the API is called directly from the browser. Without it, Anthropic's API rejects the request. This is intentional for this local tool.
