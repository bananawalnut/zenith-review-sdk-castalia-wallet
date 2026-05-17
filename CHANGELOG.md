# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- SDK-owned global review HUD (`createReviewHud`) — mounts into `document.body` with Shadow DOM, restores short-lived Hub auth sessions, starts/stops the global recorder, and submits to Hub without requiring consumer apps to route into or embed controls inside reviewed pages.
- SDK package scaffold files (`package.json`, lockfile, TypeScript configs) — makes the accepted Review SDK API buildable from a fresh checkout instead of relying on untracked local files.
- Runtime review auth session helpers (`createReviewAuthSession`, `getReviewAuthSession`) and exported auth/session types — lets public staging clients authenticate against Hub for short-lived review intake tokens without bundling durable frontend secrets.
- Headless auth session manager and Zenith admin overlay renderer — lets client sites trigger login from custom landing-page UI, persist only short-lived session state, wrap privileged actions in a session, and show the exact Zenith Hub right-side menu mark/tooltip treatment as the authenticated admin affordance.
- Authenticated review submission fields and headers — binds asset uploads and review JSON payloads to Hub project/deployment scope so Hub can enforce the review session contract.
- `captureScreenshots` option (default `true`) — uses `getDisplayMedia` to grab a WebP screenshot on every stroke-ended and committed text selection; falls back gracefully if permission is denied or `ImageCapture` is unavailable. Combines screen capture and microphone into a single permission dialog when both are active.
- `timeLimitMs` option (default `420000`, 7 minutes) — auto-calls `stop()` and emits `time-limit-reached` event when the limit is reached; `0` disables the limit.
- `ReviewScreenshot` type and `screenshots` field on `ReviewRecordingResult` and `ReviewCaptureSnapshot`.
- `timeLimitReached` boolean field on `ReviewRecordingResult`.
- New event types: `screenshot-captured`, `time-limit-reached`.
- `sessionContext` field on `ReviewRecordingResult` — captures URL, title, scroll position, and viewport size at record start.
- Navigation capture via patched `history.pushState`/`replaceState`, `popstate`, `hashchange`, and `MutationObserver` on `document.title` — each change logs a `navigation` event with the new URL and title. Enables SPA session replay reproducibility (e.g. swirl-ui tab switches).
- New event types: `session-start`, `navigation`.
