# ADR 004 — Local-Only Analytics

**Status:** Accepted
**Date:** 2025-01-22

## Context

Life To Do needs usage analytics to power the Insights dashboard (task completion rates, weekly velocity, context distribution). The choice of analytics architecture has direct implications for user privacy, offline capability, and GDPR compliance.

## Decision

Store **all analytics events locally in Dexie** (`analytics_events` table). No data is sent to any third-party analytics service (e.g., Mixpanel, Amplitude, Google Analytics). The Insights dashboard reads directly from the local Dexie table. Pro users who enable cloud sync have their analytics events synced to their own Supabase account — not a shared data warehouse.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Mixpanel / Amplitude | Third-party data sharing; requires network; GDPR consent banner required. |
| Google Analytics | Same privacy concerns; overkill for single-user productivity metrics. |
| Vercel Analytics (web vitals only) | Acceptable for performance metrics but not task-level behaviour data. |
| PostHog self-hosted | Requires a server; adds operational complexity for v1. |

## Consequences

**Positive:**
- Privacy-first by default — no personal data ever leaves the device without explicit user consent.
- GDPR-compliant without a consent banner for analytics.
- Analytics work fully offline.
- Users own their own data.

**Negative:**
- No cross-session or cross-device aggregation for Free tier users.
- Cannot A/B test features without a server-side experiment framework.
- Analytics data is lost if the user clears browser storage.
