# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- `captureScreenshots` option (default `true`) — uses `getDisplayMedia` to grab a WebP screenshot on every stroke-ended and committed text selection; falls back gracefully if permission is denied or `ImageCapture` is unavailable. Combines screen capture and microphone into a single permission dialog when both are active.
- `timeLimitMs` option (default `420000`, 7 minutes) — auto-calls `stop()` and emits `time-limit-reached` event when the limit is reached; `0` disables the limit.
- `ReviewScreenshot` type and `screenshots` field on `ReviewRecordingResult` and `ReviewCaptureSnapshot`.
- `timeLimitReached` boolean field on `ReviewRecordingResult`.
- New event types: `screenshot-captured`, `time-limit-reached`.
- `sessionContext` field on `ReviewRecordingResult` — captures URL, title, scroll position, and viewport size at record start.
- Navigation capture via patched `history.pushState`/`replaceState`, `popstate`, `hashchange`, and `MutationObserver` on `document.title` — each change logs a `navigation` event with the new URL and title. Enables SPA session replay reproducibility (e.g. swirl-ui tab switches).
- New event types: `session-start`, `navigation`.
