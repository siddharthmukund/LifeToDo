# ADR 015 — AI Suggests, Human Confirms

## Status: Accepted

## Decision
No AI feature silently modifies user data. Every AI output is presented as a dismissable suggestion. Users confirm before any data is written.

## Rationale
- Trust: Users who discover silent AI modifications lose trust immediately
- GTD philosophy: GTD is about the user's trusted system — AI is a support tool, not an autopilot
- Error rate: Even good LLMs are wrong ~10-20% of the time on structured extraction

## Consequences
- ✅ Users remain in control of their system
- ✅ AI errors are surfaced and correctable
- ⚠️ Slightly more friction than fully automatic categorization
- Tradeoff accepted: friction is worth the trust and correctability
