# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite) — also serves /api/generate locally
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test or lint tooling is configured.

## Architecture

Single-page React app (Vite) with all logic in **`App.jsx`**. There is no routing, no component separation beyond the top-level `App`, and no state management library.

**Data flow:**
1. User enters a topic + student word associations + a word count slider value
2. `generate()` POSTs to `/api/generate` (a serverless function) requesting ~N associated words scored 1–100 by frequency
3. The response (JSON array `[{word, score}]`) is parsed and passed to `renderVisualization()`
4. `renderVisualization()` draws everything onto a `<canvas>` element (900×1100px) using the Canvas 2D API — no external visualization library

**Canvas rendering pipeline** (all in `App.jsx`):
- `drawOpalPearl()` — draws a layered gradient "pearl" at center with the topic's primary student word
- Student associations are placed in concentric rings around the pearl
- AI field words are scattered in the outer area using a seeded LCG pseudo-random placer with collision detection (`anyOverlap()`)
- Word size and color are driven by normalized score via `fieldColor()` (HSL)
- Final canvas can be exported as PNG via `download()`

**API proxy (`api/generate.js`):** The Anthropic API key never reaches the browser. The client POSTs to `/api/generate`, which is a Vercel serverless function that adds the key server-side and forwards to Anthropic. In local dev, a Vite plugin middleware in `vite.config.js` handles the same `/api/generate` route using `ANTHROPIC_API_KEY` from `.env`.

**Deployment:** Hosted on Vercel. `ANTHROPIC_API_KEY` must be set as an environment variable in the Vercel project settings. Vercel auto-deploys on push to `main`.
