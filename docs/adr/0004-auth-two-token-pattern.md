# ADR 0004: Auth.js session + short-lived server-minted API JWT

**Status:** Accepted
**Date:** 2026-07-11

## Context

The stakeholder specified Auth.js for SSO (Google Workspace / Microsoft 365)
and a NestJS API verifying tokens via a shared secret. Auth.js's default
session token, however, is an encrypted JWE (via `jose`, A256GCM), not a
plain signed JWT — `passport-jwt`'s standard HS256 shared-secret verification
cannot decode it directly. Re-implementing JWE decryption in the API just to
read a token designed for Auth.js's own internal use would tightly couple
the API to Auth.js's internal token format, which is not a stable public
contract.

## Decision

Keep two distinct tokens with two distinct jobs:
1. **Auth.js session** (browser cookie) — proves the browser is logged in.
   Never sent to the API.
2. **Short-lived API JWT** (5 minutes, HS256, `{sub, email, name}`) — minted
   server-side, per request, by `apps/web/src/lib/api-token.ts` (marked
   `server-only`), from the current Auth.js session. Sent as
   `Authorization: Bearer` only by the same-origin proxy route
   (`app/api/proxy/[...path]/route.ts`), never constructed or held by the
   browser.

## Consequences

- The browser never possesses a token the API will accept — even if XSS
  exfiltrated everything in `document.cookie`/`localStorage`, there's no
  API-bearer token to steal, only the Auth.js session cookie (which is
  `httpOnly` and useless outside Auth.js's own flow).
- Every browser → API call incurs one extra hop (browser → Next.js proxy →
  NestJS API) instead of calling the API directly. Acceptable for the
  current scale; would be worth revisiting only if proxy latency becomes
  measurable at higher traffic.
- `AUTH_SECRET` must be identical across `apps/web` and `apps/api` in every
  environment — this is the one piece of shared runtime config the two apps
  truly depend on matching exactly.
