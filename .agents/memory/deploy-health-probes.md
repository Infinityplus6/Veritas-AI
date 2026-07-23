---
name: Deployment health probes per service
description: Every HTTP service in an artifact.toml needs a passing startup health path or publish fails at promote.
---

The deployer probes each service's `[services.production.health.startup].path` (default `GET /`) and requires HTTP 200 before promoting. A service whose root returns 404 (e.g. a FastAPI app that only mounts prefixed routes) fails the promote step with a "failed" build and **no runtime logs**.

**Why:** July 2026 Veritas AI publish failed exactly this way — build phase passed, promote failed silently because the Python model service had no health path and returned 404 on `/`.

**How to apply:** When adding any extra service to an artifact.toml, always set `[services.production.health.startup] path = "/<something-that-returns-200-immediately>"` and make sure that route responds 200 even while the service is still warming up (e.g. a status endpoint that reports loading state).
