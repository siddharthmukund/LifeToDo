# ADR 016 — Server-Side AI Proxy

## Status: Accepted

## Decision
LLM API keys live exclusively in server-side environment (Next.js API route / Firebase Cloud Function). Client calls our proxy, never the LLM provider directly.

## Rationale
Client JS bundles are public — anyone can open DevTools and extract embedded keys, leading to unauthorized usage and surprise billing. Server-side proxy also enables per-user rate limiting and usage monitoring.

## Consequences
- ✅ API keys never exposed to users
- ✅ Server-side rate limiting per Firebase UID
- ✅ Provider can be switched without client deploys
- ⚠️ Adds ~50-100ms latency for the extra network hop
- ⚠️ Requires server infrastructure (Next.js API routes or Firebase Functions)
