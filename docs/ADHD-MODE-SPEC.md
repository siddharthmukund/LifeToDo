# Life To Do — ADHD Mode Product Spec

> **What this document is:** A detailed product spec for Life To Do's ADHD Mode — a comprehensive, toggleable experience layer that adapts every GTD screen and interaction for adults with ADHD. When ADHD Mode is OFF, the app is a clean, capable GTD execution engine (as defined in iCCW #1). When ADHD Mode is ON, the app transforms to compensate for executive function gaps — smaller lists, one-task view, gentle structure, forgiving overdue states, AI-assisted decomposition, and dopamine-driven progress. Same codebase, same data, different experience.
>
> **How it integrates with the prompt chain:** This spec extends the ADHD Mode foundation laid in iCCW #2 (max 7 items, calm palette, single CTA per screen) with deep ADHD-specific features, flows, and rationale. Feed this document into any Claude Code session alongside the iCCW chain. It does NOT replace iCCW #1 or #2 — it enriches what ADHD Mode means when toggled on.

---

## Architecture: Two Experiences, One Codebase

```
┌─────────────────────────────────────────────────┐
│                  Life To Do                      │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │   Default Mode    │  │     ADHD Mode         │ │
│  │                   │  │   (toggle in Settings) │ │
│  │ • Standard GTD    │  │ • All of Default, plus:│ │
│  │ • Full task lists │  │ • Max 7 items/view     │ │
│  │ • Decision tree   │  │ • One-task-at-a-time   │ │
│  │   clarify         │  │ • Morning 3 ritual     │ │
│  │ • Standard review │  │ • Guided 10-min review │ │
│  │ • Regular overdue │  │ • No shame/overdue     │ │
│  │   badges          │  │ • Welcome back flow    │ │
│  │ • XP + levels     │  │ • Growing garden       │ │
│  │   (if gamification│  │ • Focus timer          │ │
│  │    enabled)       │  │ • Transition nudges    │ │
│  │ • Full celebrate  │  │ • Gentle celebrations  │ │
│  │                   │  │ • Streak with grace    │ │
│  │                   │  │ • Auto-archive stale   │ │
│  │                   │  │ • AI decomposition     │ │
│  │                   │  │ • Evening wind-down    │ │
│  └──────────────────┘  └──────────────────────┘ │
│                                                  │
│        Toggle: Settings → Accessibility          │
│        Suggested during onboarding               │
└─────────────────────────────────────────────────┘
```

**Toggle behavior:**
- ADHD Mode is OFF by default
- Suggested during onboarding: "Do you have ADHD or find traditional to-do apps overwhelming?" → Yes activates ADHD Mode
- Can be toggled anytime in Settings → Accessibility
- Toggle is instant — no app restart. All screens adapt immediately via `useADHDMode()` hook (already exists in iCCW #2-3)
- User data is identical regardless of mode — switching modes never loses information

**What Default Mode already provides (iCCW #1):**
- Full 5-phase GTD workflow with standard task lists, decision-tree clarify, weekly review
- Voice capture, text capture, share sheet, AI features (Pro)
- Standard overdue badges, full-length celebrations, regular streaks
- Energy filtering, context filtering, project management
- All features work. Nothing is broken. This is a complete, professional GTD app.

**What ADHD Mode adds on top:**
- Everything below. Every feature in this spec activates ONLY when ADHD Mode is ON.

---

## ADHD Mode Pillars

### Pillar 1: Reduced Overwhelm (Cognitive Load Management)

**What changes when ADHD Mode is ON:**

| Element | Default Mode | ADHD Mode ON |
|---------|-------------|--------------|
| **Task list length** | Full list with scroll | Max 7 items per view, paginated ("Page 1 of 3") |
| **Inbox display** | All unprocessed items visible | Top 5 shown, "and 8 more" collapsed |
| **Engage view** | Filtered task list (context + energy) | **One-task-at-a-time** full-screen card. Swipe to skip. |
| **Project view** | All projects with task counts | Top 3 active projects, others collapsed |
| **Buttons per screen** | Multiple CTAs | Single primary CTA, secondaries visually recessed |
| **Infinite scroll** | Allowed | Disabled — hard page breaks |
| **AI suggestions** | Up to 5 shown | Max 2-3 shown, rest collapsed |
| **Decision points** | Standard (all options visible) | Reduced (binary choices where possible) |

**Implementation:** The `useADHDMode()` hook returns `adhdMode: boolean`. Components conditionally render:
```typescript
const itemsToShow = adhdMode ? Math.min(items.length, 7) : items.length;
const showOneAtATime = adhdMode && screen === 'engage';
```

---

### Pillar 2: Gentle Structure (ADHD-Only Routines)

These features ONLY appear when ADHD Mode is ON. Default Mode users don't see them.

#### Morning 3 Ritual

```
Trigger: User opens app in the morning (before noon, configurable) with ADHD Mode ON

1. "Good morning! Pick 3 things for today."
2. AI suggests 3 based on: deadlines, energy patterns, stale items
3. User can accept, swap, or pick from all actions
4. Shown as 3 draggable cards — arrange by gut feel, not priority matrix
5. "Your day is set. Start whenever you're ready."

Default Mode: User opens app → sees standard Today view with all filtered tasks
```

**Why ADHD Mode only:** Neurotypical users manage their own day prioritization. The Morning 3 exists because ADHD brains struggle to self-initiate and prioritize from an open list — 3 items creates achievable commitment without triggering choice paralysis.

#### Focus Timer

```
Trigger: User taps "Focus" on a task card (ADHD Mode ON only)

1. "Ready to focus? Pick your time." → 15 / 25 / 45 min
2. Timer starts. Single task displayed. Phone DND suggested.
3. Timer visible but not obtrusive.
4. On complete: celebration + "Nice. Take a breath."

Default Mode: No focus timer integration. Users manage their own focus.
```

**Why ADHD Mode only:** Time blindness is an ADHD-specific trait. Neurotypical users perceive time normally and don't need an externalized timer embedded in their task view.

#### Transition Nudges

```
Between tasks in ADHD Mode:

1. Task complete → celebration → 30-second pause screen
2. "Nice work. Take a moment."
3. Option: "Ready for the next one?" or "Take a break — I'll be here."
4. Next task appears only when user taps "Ready"

Default Mode: Task complete → back to task list immediately
```

**Why ADHD Mode only:** ADHD brains struggle with task-switching and impulse control. Without the transition nudge, an ADHD user completing a task might impulsively check social media instead of moving to the next action. The nudge creates a micro-ritual that channels that transition energy.

#### Evening Wind-Down

```
Trigger: Push notification at user-configured time (default 9 PM), ADHD Mode ON only

1. "Quick check before bed?"
2. "Did you do your Morning 3?" → show progress (2 of 3 ✓)
3. "Anything to capture before sleep?" → quick capture input
4. "Good night. Everything's safe in the system. 🌙"

Default Mode: No evening notification. Standard push notifications only.
```

**Why ADHD Mode only:** ADHD minds race at bedtime with open loops. The evening wind-down explicitly closes the loop — "everything's captured, nothing will be forgotten" — reducing the rumination that causes ADHD insomnia.

---

### Pillar 3: Forgiving System (ADHD-Only Mercy Mechanics)

These behaviors activate ONLY when ADHD Mode is ON. Default Mode retains standard overdue/streak handling.

| Behavior | Default Mode | ADHD Mode ON |
|----------|-------------|--------------|
| **Overdue tasks** | Red badge, "OVERDUE" label, overdue count in nav | No red. No "OVERDUE" label. Neutral prompt: "This has been waiting. Still relevant?" |
| **Missed streak** | "Streak broken. 0 days." | "Starting fresh! Your garden's ready to grow again." Grace days: miss 1 day, keep streak. |
| **Return after gap** | Standard app open → see all tasks + overdue count | Welcome Back flow (see below) |
| **Stale items** | Stale nudge notification (iCCW #4) | Auto-archive after 30 days. Notification: "Moved 5 old items to Maybe Later." |
| **Skipped task** | Task moves back to list | "No worries — moved to later. It'll come back when the time is right." |
| **Due date language** | "Due: Thursday" | "Aim for Thursday" |
| **Failed daily goal** | "0 of 3 completed" | "You started 1 today. That counts." (reframe partial completion as win) |

#### Welcome Back Flow (ADHD Mode Only)

```
Trigger: App opened after 3+ days of inactivity, ADHD Mode ON

1. "Hey! Glad you're back. 🌿"
   (NO mention of days away, overdue count, or missed anything)

2. "A few things piled up. Quick 2-minute sweep?"
   → Show top 5 time-sensitive items only
   → For each: "Still relevant?" → Keep / Archive / Reschedule

3. Auto-archive items stale 30+ days
   → "Moved 5 old items out of your way."

4. Garden: slightly wilted → starts recovering on use

5. "Want to pick your Morning 3?" → back to normal flow

Default Mode: App opens normally. User sees full task list + any overdue badges.
```

**Why ADHD Mode only:** Re-entry anxiety is an ADHD-specific blocker. Neurotypical users can face a backlog and work through it methodically. For ADHD users, seeing "47 overdue tasks" triggers shame → avoidance → app abandonment. The Welcome Back flow eliminates this wall.

---

### Pillar 4: AI-Assisted Executive Function (ADHD-Enhanced AI)

AI Coach features exist in both modes (iCCW #9), but ADHD Mode changes *how* they present and *when* they activate.

| AI Feature | Default Mode | ADHD Mode ON |
|-----------|-------------|--------------|
| **Clarify flow** | Decision tree: Actionable? → 2-min rule? → Context | **Conversational:** "What would 'done' look like? Here are 2 suggestions..." |
| **Task decomposition** | AI suggests sub-tasks (user initiates) | AI **auto-suggests** decomposition for any task estimated >15 min |
| **Smart Capture parsing** | Parse NLP → show confidence chips | Same + "Added. You can organize later." (deferred processing reassurance) |
| **Priority Picker** | "I'd recommend this task. Here's why." | **"Do this one next."** — shorter reasoning, more directive |
| **Brain Dump** | Available as a feature | **Prominently surfaced** — "Feeling overwhelmed? Dump it all here." |
| **Review Coach** | Streaming chat, 10 turns max | **5-step guided flow** (not chat). Each step has a clear endpoint. "Step 3 of 5: Stale stuff." |
| **Content Drafter** | Draft available on request | Auto-suggests: "This looks like an email task. Want me to draft a starter?" |
| **Suggestions count** | Up to 5 | Max 2-3 (fewer choices = faster decisions) |

**Conversational Clarify (ADHD Mode):**
```
Default Mode:
  "Is this actionable?" → Yes/No
  → "Can it be done in 2 minutes?" → Yes/No
  → "What's the next action?" → [blank text field]
  → "What context?" → [multi-select]

ADHD Mode:
  "Call dentist about cleaning"
  AI: "Quick phone call? I'd say ~5 min, 📱 phone, low energy."
  [✓ Looks right] [✏️ Adjust] [Skip — I'll do this later]
  → One tap to confirm, done
```

**Why ADHD Mode only:** The conversational clarify bypasses the executive function required to navigate a decision tree. Default Mode users can handle structured choices; ADHD users need suggestions they react to rather than blank fields they fill.

---

### Pillar 5: Dopamine by Design (ADHD-Only Progress Visuals)

Default Mode uses standard gamification (iCCW #12: XP, levels, achievements). ADHD Mode replaces or augments these with ADHD-appropriate feedback.

| Element | Default Mode | ADHD Mode ON |
|---------|-------------|--------------|
| **Progress metaphor** | XP bar + level number | **Growing garden** — plants bloom with use, wilt gently during gaps, recover on return |
| **Task completion** | Confetti/sparkle animation | **Simpler, warmer** — gentle pulse + "Nice." (no overwhelming particle effects) |
| **Daily counter** | Optional in gamification UI | **Always visible:** "3 things done today ✓" persistent banner |
| **Done history** | Lifetime stats in Profile | **Prominent "Done" tab** — scrollable feed of this week's completions. Wins only, no remaining tasks. |
| **Streak display** | "14-day streak 🔥" | "14 days growing 🌱" (growth language, not fire/chain language) |
| **Broken streak** | "Streak lost. Starting over." | "Your garden rests too. Back at it? 🌿" |
| **Weekly review reward** | 50 XP | 50 XP + garden bloom animation + "Your garden just flowered!" |
| **Shame metrics** | Tasks overdue count visible in nav badge | **Hidden.** No overdue count in nav. No "days since last login." |
| **Achievement tone** | "Inbox Zero Hero — Clear your inbox 10 times" | "Inbox Zero Hero — You cleared the clutter 10 times! 🧹" (warmer phrasing) |

#### The Garden (ADHD Mode Only)

```
Visual: Home screen shows a small garden that reflects the user's GTD practice.

States:
  - Growing:     Active use → plants growing, flowers appearing
  - Blooming:    Weekly review completed → garden blooms
  - Resting:     1-3 days inactive → garden is still, slightly muted (NOT dead)
  - Recovering:  Return after gap → garden brightens immediately on first action

Rules:
  - Garden NEVER dies. Worst state is "resting."
  - Every action adds growth (captures = seedlings, clarify = stems, review = bloom)
  - Cosmetic unlockables from achievements (new plants, decorations, seasons)
  - Purely visual — no gameplay mechanics, no resource management
```

**Why ADHD Mode only:** ADHD brains have a dopamine regulation deficit — long-term rewards provide zero motivation. The garden creates immediate visual feedback for every action. Default Mode users are motivated by standard XP/levels; ADHD users need warmer, more emotionally resonant progress metaphors that also handle gaps gracefully (plants rest; chains break).

---

### Pillar 6: Tone Adaptation (ADHD-Friendly Language)

When ADHD Mode is ON, microcopy throughout the app shifts:

| Context | Default Mode | ADHD Mode ON |
|---------|-------------|--------------|
| Task added | "Task added to inbox." | "Added ✓ — organize whenever youre ready." |
| Overdue task | "Overdue — 3 days late" | "This has been sitting a while. Still on your radar?" |
| All daily tasks done | "Today's tasks completed." | "All done! Look at you. 🌱" |
| Task skipped | "Task moved to later." | "No worries — it'll come back when the time is right." |
| Focus timer start | "Timer started: 25 minutes." | "Let's go. I'll keep the clock — you focus." |
| Streak broken | "Streak reset to 0." | "New streak starts today. Your garden's ready." |
| Weekly review prompt | "Weekly review is due." | "Sunday check-in? 10 minutes, tops. Future you will be glad." |
| Brain dump complete | "5 items extracted." | "All out of your head and safe here. Breathe. 🧠→📱" |
| Return after gap | [standard app open] | "Hey! Glad you're back. 🌿" |
| Empty inbox | "Inbox zero." | "Inbox zero — nothing hanging over you. Enjoy the calm." |
| Partial daily completion | "1 of 3 completed." | "You got 1 done today. That counts." |

**Implementation:** All ADHD Mode copy lives in a dedicated i18n namespace (`messages/{locale}/adhd.json`) alongside the standard namespace. The `useADHDMode()` hook drives which copy is rendered:
```typescript
const t = useTranslations(adhdMode ? 'adhd' : 'common');
```

---

## ADHD Mode Features Summary

| # | Feature | Pillar | ADHD Pain Point | GTD Step | Default Mode Has This? |
|---|---------|--------|----------------|----------|:-----:|
| 1 | Max 7 items per view | Overwhelm | Choice paralysis from long lists | All | ❌ |
| 2 | One-task-at-a-time Engage view | Overwhelm | Comparison paralysis from seeing alternatives | Engage | ❌ |
| 3 | Morning 3 ritual | Structure | Can't self-initiate or prioritize from open list | Engage | ❌ |
| 4 | Focus timer | Structure | Time blindness — no internal sense of duration | Engage | ❌ |
| 5 | Transition nudges | Structure | Impulsive task-switching, no rest between actions | Engage | ❌ |
| 6 | Evening wind-down | Structure | Racing thoughts at bedtime from open loops | Reflect | ❌ |
| 7 | Guided 10-min review (5 steps) | Structure | 60-minute review is too long, too boring | Reflect | ❌ |
| 8 | No overdue shame (no red, no count) | Forgiving | Shame spiral from visible failures | All | ❌ |
| 9 | Welcome back flow | Forgiving | Re-entry anxiety after gap kills reactivation | All | ❌ |
| 10 | Auto-archive stale items (30 days) | Forgiving | Growing backlog creates guilt | Organize | ❌ |
| 11 | Streak with grace days | Forgiving | All-or-nothing thinking destroys habits | Reflect | ❌ (regular streaks) |
| 12 | "Not today" swipe without guilt | Forgiving | Bad days need permission, not judgment | Engage | ❌ (standard skip) |
| 13 | Soft deadline language ("Aim for") | Forgiving | Hard deadlines trigger panic/ignore cycle | Organize | ❌ |
| 14 | Conversational clarify (not tree) | AI-Assisted | Decision trees require executive function | Clarify | ❌ (decision tree) |
| 15 | Auto-suggest decomposition (>15 min) | AI-Assisted | Can't break down tasks independently | Clarify | ❌ (user-initiated) |
| 16 | Directive priority picker | AI-Assisted | Can't prioritize — everything feels equal | Engage | ❌ (suggestive) |
| 17 | Prominent Brain Dump surfacing | AI-Assisted | Overwhelm needs an immediate outlet | Capture | ❌ (feature exists, not surfaced) |
| 18 | Growing garden metaphor | Dopamine | Numbers don't motivate — emotional visuals do | All | ❌ (XP bar) |
| 19 | Daily win counter (persistent) | Dopamine | "I did nothing today" distortion | Engage | ❌ |
| 20 | Done history feed | Dopamine | Negativity bias — only see remaining tasks | Reflect | ❌ |
| 21 | Warmer tone throughout | Tone | Standard app language feels cold/judgmental | All | ❌ |
| 22 | Reduced celebration intensity | Tone | Overwhelming animations overstimulate | All | ❌ (full celebrations) |

---

## Key ADHD Mode Flows

### Flow 1: Morning 3 → Focus → Done (ADHD Mode Only)

```
1. MORNING 3 (< 90 seconds)
   ├── "Good morning! Pick 3 things for today."
   ├── AI suggests 3 → user accepts, swaps, or picks freely
   ├── 3 draggable cards — arrange by gut feel
   └── "Your day is set. Start whenever."

2. ENGAGE — ONE AT A TIME
   ├── Full-screen single task card: "Do this next."
   ├── Optional: "Focus?" → 15/25/45 min timer
   └── Complete → celebration → "1 of 3 done!"

3. TRANSITION NUDGE
   ├── 30-second pause: "Nice work. Take a moment."
   ├── "Ready?" or "Take a break — I'll be here."
   └── Next task when user taps Ready

4. COMPLETION
   ├── All 3 → garden grows + warm celebration
   └── "Your Morning 3 is done. Anything else, or call it a win?"
```

### Flow 2: Welcome Back (ADHD Mode Only)

```
Trigger: App opened after 3+ days, ADHD Mode ON

1. "Hey! Glad you're back. 🌿"
   (NO mention of days away or overdue count)

2. "Quick 2-minute sweep?"
   → Top 5 time-sensitive items → Keep / Archive / Reschedule

3. Auto-archive 30+ day stale items
   → "Moved 5 old items out of your way."

4. Garden recovers. Streak: grace day or "Starting fresh!"

5. "Want to pick your Morning 3?" → normal flow
```

### Flow 3: Conversational Clarify (ADHD Mode Only)

```
Default Mode: Decision tree (Actionable? → 2-min rule? → Context → Done)

ADHD Mode:
1. Item shown: "Call dentist about cleaning"
2. AI: "Quick phone call? I'd say ~5 min, 📱 phone, low energy."
3. [✓ Looks right]  [✏️ Adjust]  [Skip for now]
4. One tap → clarified. Next item.
```

### Flow 4: Guided 10-Minute Review (ADHD Mode Only)

```
Default Mode: Standard weekly review checklist (David Allen template)

ADHD Mode:
Step 1: "Clear inbox" → AI-assisted, one-tap confirmations
Step 2: "Stale stuff" → "These 4 haven't moved. Keep, archive, or rethink?"
Step 3: "Projects check" → "Any projects need a new next action?"
Step 4: "Next week" → "Pick 1-3 focus areas for the week."
Step 5: "Win of the week" → "What are you proud of?"

→ "Review done! 🌱 Garden blooms."
→ Abort anytime: "Save progress — finish later."
```

### Flow 5: Brain Dump → Process (Enhanced in ADHD Mode)

```
Feature exists in both modes. In ADHD Mode:

1. Brain Dump is PROMINENTLY surfaced
   → "Feeling overwhelmed? Dump it all here." (visible on inbox screen)

2. After AI extraction:
   → Default Mode: "5 items extracted. Process now?"
   → ADHD Mode: "All out of your head and safe here. Breathe. 🧠→📱"
                 "Process them whenever — they're safe."

3. Processing is explicitly deferred in ADHD Mode (no pressure)
```

---

## Why This Works for ADHD

| Pillar | Executive Function Gap | How ADHD Mode Compensates |
|--------|----------------------|--------------------------|
| **Reduced Overwhelm** | Working memory overload | Max 7 items, one-task view, binary choices, collapsed complexity |
| **Gentle Structure** | Routine initiation deficit | Morning 3 creates daily scaffolding. Focus timer externalizes time. Evening wind-down closes loops. |
| **Forgiving System** | Emotional regulation deficit | No shame metrics, no red overdue, warm welcome back, auto-archive stale items, grace days |
| **AI-Assisted Executive Function** | Task decomposition deficit | Conversational clarify, auto-decomposition, directive priorities — AI does the hard thinking |
| **Dopamine by Design** | Dopamine regulation deficit | Garden grows with every action, daily win counter, done history shows accomplishments, warm celebrations |
| **Tone Adaptation** | Rejection sensitivity | Warmer copy throughout, no judgmental language, partial completion reframed as wins |

---

## Integration with iCCW Prompt Chain

### What Changes in Existing Prompts

| iCCW # | Change Required | Details |
|--------|:-:|---------|
| **#1 Spec** | 🟡 Add | Add Morning 3, focus timer, evening wind-down, welcome back flow, one-task view as ADHD Mode features in screen specs |
| **#2 Refinement** | 🟡 Extend | Current ADHD rules (max 7 items, calm palette, single CTA) stay. Add: garden visual, conversational clarify, tone adaptation, forgiving mechanics, structured routines |
| **#3 Figma-to-Code** | 🟡 Add | New ADHD-only components: MorningThree, OneTaskCard, FocusTimer, TransitionNudge, WelcomeBack, EveningWindDown, GardenView, GardenPlant, DailyWinCounter, DoneHistory |
| **#4 Enhancement** | 🟢 Small | New analytics events: morning_3_completed, focus_timer_started, welcome_back_sweep, brain_dump_adhd. Auto-archive stale items (upgrade from nudge). |
| **#5 Theme** | 🟢 Small | Garden visuals need both light/dark themes. Tone tokens for ADHD warm copy. |
| **#7 Native** | 🟡 Add | Evening wind-down push notification. Focus timer DND integration. Quick-add widget priority. |
| **#9 AI Coach** | 🟡 Modify | Conversational clarify as ADHD variant. Auto-decomposition threshold (>15 min). Directive priority picker. Brain Dump prominence. Guided 5-step review. |
| **#10 Localization** | 🟢 Small | New i18n namespace: `adhd.json` per locale. Garden state labels. Tone translations. |
| **#11 Profiles** | 🟢 Small | Onboarding: "Do you have ADHD?" → suggest ADHD Mode. Setting location unchanged. |
| **#12 Gamification** | 🟡 Modify | Garden as ADHD Mode visual (parallel to XP bar in default). Streak grace days ADHD-only. Done history ADHD-only. Celebration intensity reduction. |
| **#13 Accessibility** | 🟢 Small | Screen reader support for garden, one-task view, focus timer, Morning 3, transition nudges. |

### New Components Required (ADHD Mode Only)

```
src/components/adhd/              # All ADHD Mode-exclusive components
├── MorningThree.tsx              # Morning 3 card picker + AI suggestions
├── OneTaskCard.tsx               # Full-screen single-task engage view
├── FocusTimer.tsx                # Timer with DND integration
├── TransitionNudge.tsx           # Between-task pause screen
├── WelcomeBack.tsx               # Return-after-gap flow
├── EveningWindDown.tsx           # Before-bed capture + closure
├── GardenView.tsx                # Growing garden progress metaphor
├── GardenPlant.tsx               # Individual plant with growth states
├── DailyWinCounter.tsx           # Persistent "X things done today" banner
├── DoneHistory.tsx               # Scrollable feed of completed items
├── ConversationalClarify.tsx     # AI-powered one-tap clarify (replaces decision tree)
├── GuidedReview.tsx              # 5-step 10-minute review
├── SoftDeadlineBadge.tsx         # "Aim for Thursday" (replaces "DUE: Thursday")
├── NotTodaySwipe.tsx             # Guilt-free task deferral
└── index.ts
```

### Conditional Rendering Pattern

Every ADHD Mode feature uses the existing `useADHDMode()` hook:

```typescript
// In Engage screen
const { adhdMode } = useADHDMode();

if (adhdMode) {
  return hasMorning3 ? <OneTaskCard task={currentTask} /> : <MorningThree />;
}
return <StandardTaskList tasks={filteredTasks} />;
```

```typescript
// In Review screen  
const { adhdMode } = useADHDMode();

return adhdMode ? <GuidedReview /> : <StandardReviewChecklist />;
```

```typescript
// Overdue badge
const { adhdMode } = useADHDMode();

if (adhdMode) {
  return <SoftDeadlineBadge date={dueDate} />; // "Aim for Thursday"
}
return <OverdueBadge date={dueDate} />;          // "OVERDUE — 3 days"
```

---

## What Stays the Same Regardless of Mode

These work identically whether ADHD Mode is ON or OFF:

- GTD 5-phase workflow: Capture → Clarify → Organize → Reflect → Engage
- Voice-first capture, Share Sheet, image capture
- All data models, sync, offline-first architecture
- Authentication, subscription, billing
- AI Coach core features (Smart Capture, Brain Dump, Auto-Split, Content Drafter)
- Accessibility (WCAG 2.2 AA)
- Localization (8 locales)
- Native wrappers (Capacitor, push notifications, biometric)
- Theme system (light/dark)
- Project management, context tagging, energy filtering

**The data is the same. The experience adapts.**

---

*This spec enriches ADHD Mode from a visual simplification layer (iCCW #2) into a comprehensive executive function support system — while keeping it firmly behind a toggle. Default Mode remains a capable GTD app for everyone.*
