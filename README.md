# Zenith Review SDK

Minimal browser SDK for consent-based review recording.

The package owns four things only:

- recording session data: cursor, clicks, key presses, highlighted text, strokes, and audio chunks
- an opt-in transparent canvas overlay used for drawing while a recording is active
- runtime review-auth helpers for short-lived Hub review sessions
- an SDK-owned global review HUD mounted into the page shell via Shadow DOM, not embedded inside a host-app route or reviewed element

Normal recording starts in highlight mode and does not mount the drawing overlay. While recording, holding Command temporarily enters drawing mode, mounts the transparent canvas above the host app, and enables drawing input. Releasing Command returns to highlight mode while completed strokes fade out.

## Authenticated Hub submissions

Public staging clients should expose only public configuration such as `hubUrl`, `projectId`, and `deploymentId`. Do not bundle durable review tokens, access codes, or owner secrets in frontend code or public environment variables.

Before calling `submitReview`, authenticate the reviewer at runtime. For public staging clients, prefer the SDK-native Zenith auth overlay so host apps do not rebuild review auth UI:

```ts
import { authenticateReviewSession, submitReview } from '@zenith/review-sdk'

const session = await authenticateReviewSession({
  hubUrl,
  projectId,
  deploymentId,
  subjectId: window.location.href,
  storage: 'session',
})

await submitReview(recording, {
  hubUrl,
  subjectId: window.location.href,
  projectId,
  deploymentId,
  authToken: session.token,
  submittedBy: session.label,
})
```

`authenticateReviewSession` reuses a fresh `sessionStorage` session when available, validates stored sessions with Hub by default, and otherwise injects a Zenith-branded Shadow DOM auth overlay into the host page. `createReviewAuthSession` remains available for custom flows; it posts to Hub's `/v1/review-auth/session` endpoint and returns the raw short-lived token once. `submitReview` requires `projectId`, `deploymentId`, and `authToken`; it sends the Bearer token on asset and review submission and includes project/deployment identifiers in the Hub payloads.

For full-page review/reporting flows, use `createReviewHud(...)` instead of embedding review controls into a host-app page. The HUD mounts itself into `document.body` with isolated Shadow DOM, restores the short-lived auth session from `sessionStorage`, starts/stops the global recorder, and submits through Hub without navigating the reviewed site. If `hubUrl` is omitted, the HUD submits to the production Hub at `https://hub.zenith-research.ca`; consumers may still pass an explicit override for local development.
