# GTD Methodology Mapping

Life To Do implements David Allen's **Getting Things Done** framework. This document maps each GTD step to the corresponding app feature.

## The Five GTD Steps

### 1. Capture → Inbox

Everything goes into `/inbox` first. The `CaptureBar` component accepts free-text input and creates a raw `Task` with `status: "inbox"`. Keyboard shortcut `Cmd+K` opens the quick-capture overlay from any route.

### 2. Clarify → ClarifyFlow

The `ClarifyFlow` wizard processes each inbox item:

- **Is it actionable?** — Yes → assign next action. No → Someday or Trash.
- **Two-minute rule** — If the action takes less than 2 minutes, it is marked `do_now` and surfaced on the Today dashboard immediately.
- **Project or single action?** — Multi-step outcomes become Projects.

### 3. Organize → Lists

| GTD List | Route / Store |
|---|---|
| Projects | `/projects` |
| Contexts | Context filter on `/` |
| Waiting For | `/waiting` |
| Someday/Maybe | `/someday` |
| Calendar (due dates) | Task `dueDate` field |

### 4. Reflect → Weekly Review

`/review` walks the user through the standard Weekly Review checklist: clear inboxes, review projects, update Waiting For, process Someday/Maybe. Completion is logged to `weekly_reviews` in Dexie.

### 5. Engage → Today / ActionCard

The Today dashboard (`/`) surfaces tasks filtered by:

- **Context** — `@home`, `@computer`, `@errands`, etc.
- **Energy level** — `high`, `medium`, `low` (set per task).
- **Due date** — overdue tasks float to the top.

The `ActionCard` component presents one task at a time to reduce decision fatigue.
