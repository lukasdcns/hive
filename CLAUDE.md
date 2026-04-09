# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite with HTTPS via `@vitejs/plugin-basic-ssl`)
- **Build:** `npm run build` (runs `tsc -b && vite build`, output in `dist/`)
- **Preview production build:** `npm run preview`
- No test runner or linter is configured.

## Environment

Two env vars are required in `.env.local` (not committed):
- `VITE_TWITCH_CLIENT_ID` — Twitch application client ID
- `VITE_TWITCH_PARENT` — domain passed to Twitch embeds (e.g. `localhost`)

## Architecture

MulTwitch is a single-page React app that lets users watch multiple Twitch streams simultaneously. The UI is in French.

### Key data flow

`App.tsx` owns all top-level state: the stream list (`Stream[]`), layout mode (grid/theater), featured stream ID, and chat visibility. Session persistence uses `localStorage` via `src/utils/session.ts`, with a restore modal on reload.

### Twitch integration (three separate mechanisms)

1. **Stream embeds** — Twitch player iframes constructed directly in `StreamTile` and `TheaterLayout` using `player.twitch.tv` URLs with the `VITE_TWITCH_PARENT` env var.
2. **OAuth + Helix API** — `useTwitchAuth` handles implicit grant OAuth flow (token in URL hash, stored in `sessionStorage`). `useFollowedStreams` polls `GET /helix/streams/followed` every 60s to populate the `FollowsPanel` sidebar.
3. **Chat** — `ChatPanel` embeds the official Twitch chat iframe. `useTwitchChat` implements a raw IRC WebSocket client (`wss://irc-ws.chat.twitch.tv`) with anonymous fallback via `justinfan` nicks. This hook is defined but not currently wired into the UI (the app uses the iframe chat instead).

### Layouts

- **Grid** (`StreamGrid`) — auto-sizing grid with drag-and-drop reorder via `@dnd-kit`. Grid dimensions are computed from stream count in `getGridCols`/`getGridRows`.
- **Theater** (`TheaterLayout`) — one featured stream at 70% height, remaining streams in a horizontal strip at 30%.

### Utilities

- `parseChannel` — normalizes input to a Twitch channel name (accepts raw name or `twitch.tv` URL).
- `session.ts` — `saveSession`/`loadSession`/`clearSession` + `relativeTime` for the restore modal.
