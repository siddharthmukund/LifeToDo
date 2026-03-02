# ADR 014 — Provider-Agnostic AI Layer

## Status: Accepted

## Decision
All AI features route through a provider-agnostic `AIProvider` interface. Switching providers requires only an environment variable change — zero code changes.

## Rationale
- Vendor lock-in risk: LLM APIs change pricing, terms, and availability rapidly
- Different providers excel at different tasks (Gemini for structured output, Claude for coaching tone)
- Enterprise customers may require EU data residency (Mistral) or on-premise (Ollama via openai-compat)

## Consequences
- ✅ Single config change to switch providers
- ✅ Each provider adapter handles schema mapping natively
- ⚠️ Requires maintaining 5 adapter files — new provider API changes need updates per adapter
