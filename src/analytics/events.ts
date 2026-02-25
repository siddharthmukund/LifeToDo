// analytics/events.ts
// GTD-specific event taxonomy — iCCW #4 Enhancement Layer
// Privacy-first: no PII, no network calls — all data stays in Dexie.
//
// Naming convention: <noun>_<past_verb>  (what happened, not UI click)
// Props: non-identifying scalars only (no text content, no ids of real users)

export type GTDEventName =
  | 'inbox_item_captured'         // user adds item to inbox
  | 'inbox_item_clarified'        // user processes an inbox item to completion
  | 'inbox_zero_achieved'         // inbox reaches 0 unprocessed items
  | 'two_minute_completed'        // action with ≤5 min estimate completed
  | 'next_action_completed'       // any next action marked done
  | 'weekly_review_started'       // user begins weekly review flow
  | 'weekly_review_completed'     // user finishes all review steps
  | 'stale_item_resolved'         // stale inbox/someday/waiting item resolved
  | 'context_switch'              // user switches active context filter
  | 'energy_filter_used'          // user filters by energy level
  | 'adhd_mode_toggled'           // ADHD mode turned on or off
  | 'voice_capture_used'          // voice capture triggered

/** Optional metadata per event — scalar, non-identifying */
export type EventProps = Record<string, string | number | boolean>
