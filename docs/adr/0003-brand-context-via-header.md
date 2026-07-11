# ADR 0003: Brand context via request header, not JWT claim

**Status:** Accepted
**Date:** 2026-07-11

## Context

A hard product requirement from discovery: "one user should be able to
switch between brands without logging out." If the current brand were baked
into the access token (a common pattern — e.g. a `brandId` claim), switching
brands would require minting a new token on every switch, which either means
a token-refresh round trip on every brand click (bad UX for something meant
to feel instant) or a client-side JWT re-signing capability (which would mean
shipping the signing secret to the browser — a security non-starter).

## Decision

The brand a request applies to travels as a plain `x-brand-id` HTTP header,
set by the frontend's `BrandProvider`/`BrandSwitcher`, not as a JWT claim.
`BrandAccessGuard` resolves and authorizes it per-request. The access token
itself only ever identifies *who* the caller is, never *which brand* they're
currently acting as.

## Consequences

- Every brand-scoped endpoint must go through `BrandAccessGuard` — there is
  no way to infer the brand from the token alone. A route that reads
  `request.brandContext` without `BrandAccessGuard` in its `@UseGuards` chain
  will throw (see `CurrentBrand` decorator), which is intentional: it fails
  loudly instead of silently returning `undefined`.
- Brand switching is instant (no network round-trip beyond the next API
  call) since it's just a client-side state change.
- This does mean a compromised token grants access to *any* brand the user
  has `BrandAccess` to, not just "the brand they logged in as" — but since
  RBAC is enforced per-request server-side regardless, this doesn't expand
  the actual blast radius of a leaked token versus the claim-based approach.
