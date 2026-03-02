# AI Coach — Life To Do

An LLM-powered coaching layer across all 5 GTD phases. Provider-agnostic, offline-graceful, and consent-gated.

## Architecture

```
User action
  → Client (aiProxy.ts)
  → Next.js API route (/api/ai/proxy)
  → Server: resolveProvider() → LLM adapter
  → Structured JSON response
  → UI component updates
```

**API key never touches the client bundle.**

## Provider Configuration

Set environment variables:
```bash
NEXT_PUBLIC_AI_PROVIDER=gemini   # gemini | openai | claude | mistral | openai-compat
NEXT_PUBLIC_AI_MODEL=gemini-2.0-flash  # optional override
NEXT_PUBLIC_AI_ENDPOINT=...      # required for openai-compat (Ollama, vLLM, etc.)
AI_API_KEY=...                   # server-side only (in Cloud Functions / .env.local)
```

## Feature Map

| Phase | Feature | File | Flag |
|---|---|---|---|
| Capture | Smart Capture (NLP) | `capture/SmartCaptureParser.ts` | `ai_smart_capture` |
| Capture | Brain Dump | `capture/BrainDumpProcessor.ts` | `ai_brain_dump` |
| Capture | Coach Insight | `capture/CoachInsightLLM.ts` | `ai_coach_insight` |
| Clarify | Socratic Clarification | `clarify/SocraticClarifier.ts` | `ai_socratic_clarify` |
| Clarify | Auto-Split | `clarify/AutoSplitter.ts` | `ai_auto_split` |
| Organize | Auto-Categorization | `organize/AutoCategorizer.ts` | `ai_auto_categorize` |
| Reflect | Review Coach | `review/ReviewCoach.ts` | `ai_review_coach` |
| Reflect | Weekly Report | `review/WeeklyReportGenerator.ts` | `ai_weekly_report` |
| Engage | Priority Picker | `engage/PriorityPicker.ts` | `ai_priority_picker` |
| Engage | Content Drafter | `engage/ContentDrafter.ts` | `ai_content_drafter` |

## Consent Flow

1. First AI feature tap triggers `AIConsentDialog`
2. Dialog shows provider name dynamically
3. `[Enable AI Features]` → `grantAIConsent()` → stored in Dexie
4. `[Not Now]` → no nagging, AI buttons show inline message on next tap
5. Revocable anytime in Settings → AI Coach

## Error Handling

| Error | User sees | Recovery |
|---|---|---|
| Offline | "AI requires internet" | Auto-retry on reconnect |
| Rate limited | "You've been busy!" | Auto-retry after window |
| Timeout (>10s) | "Taking too long" | Manual fallback |
| Provider error | "AI having a moment — retry" | Exponential backoff: 1s, 2s, 4s |
| Free tier | "Pro feature — Upgrade" | Upgrade CTA |

## ADHD Mode Adjustments

- Smart Capture: only ≥0.8 confidence chips auto-shown
- Brain Dump: max 5 tasks initially ("Show more" button)
- Socratic suggestions: 2 instead of 3
- Priority Picker: just task name, no reasoning text
- Content Drafter: auto-copied to clipboard, minimal UI
