# Accessibility Testing Guide

> **Scope:** Life To Do — WCAG 2.2 Level AA
> **Last updated:** March 2026 (iCCW #13)

---

## Automated Testing

### Jest + axe-core

Tests are in `src/a11y/__tests__/`. Run:

```bash
npm test -- --testPathPattern="a11y"
```

These tests catch approximately **30-40% of WCAG violations** automatically. They cover:
- Missing ARIA roles and attributes
- Form labels
- Color contrast (limited — use manual testing too)
- Keyboard trap issues
- Landmark structure

### CI Integration

Add to your CI pipeline (GitHub Actions example):

```yaml
- name: Run accessibility tests
  run: npx jest --testPathPattern="a11y" --ci
```

### Dev Tools

Install the **axe DevTools** browser extension:
- Chrome: [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd)
- Firefox: [axe DevTools](https://addons.mozilla.org/firefox/addon/axe-devtools/)

Run a full-page scan any time the UI changes significantly.

---

## Manual Screen Reader Testing

Automated tests miss ~60-70% of real-world SR issues. Manual testing is essential.

### Screen Readers by Platform

| Platform | Screen Reader | Browser |
|---|---|---|
| macOS | VoiceOver (built-in) | Safari |
| iOS | VoiceOver (built-in) | Safari |
| Windows | NVDA (free) | Firefox |
| Windows | JAWS (commercial) | Chrome / Edge |
| Android | TalkBack (built-in) | Chrome |

### VoiceOver Quick Start (macOS)

1. Enable: **Cmd + F5** (or System Settings → Accessibility → VoiceOver)
2. Navigate: **VO + Right Arrow** moves to next element (VO = Ctrl + Option)
3. Interact: **VO + Space** activates
4. Web areas: **VO + U** opens the Rotor (headings, links, form controls)
5. Disable: **Cmd + F5** again

### VoiceOver Quick Start (iOS)

1. Enable: **Settings → Accessibility → VoiceOver → On** (or triple-click Home/Side)
2. Navigate: **Swipe right** to next element
3. Activate: **Double tap**
4. Adjust: **Swipe up/down** to change rotor item

### Testing Checklist per Page

Run through each new page with VoiceOver / NVDA:

**Navigation**
- [ ] Skip link appears on first Tab press and targets `#main-content`
- [ ] Bottom nav announces "Main navigation" as the landmark label
- [ ] Active tab reads "current page" (via `aria-current="page"`)
- [ ] Page navigation announces "Navigated to [page name]"

**Forms**
- [ ] All inputs announce their label when focused
- [ ] Required fields announce "required"
- [ ] Validation errors announce immediately via `role="alert"`
- [ ] Success messages are announced via polite live region

**Modals / Dialogs**
- [ ] Focus moves inside dialog on open
- [ ] SR announces dialog title
- [ ] Tab does not escape the dialog
- [ ] Escape closes dialog and returns focus to trigger
- [ ] Content behind dialog is not announced

**Dynamic Content**
- [ ] Task completions announce "Task completed: [name]"
- [ ] Route changes announce "Navigated to [page]"
- [ ] Error states announce via assertive channel
- [ ] Loading spinners have appropriate `aria-busy` or `aria-label`

**Touch Targets (manual verification)**
- [ ] All tap targets feel comfortable with a thumb (test on physical device)
- [ ] No accidental activations when scrolling near small buttons

---

## Touch Target Validation

### Runtime Audit (dev only)

Open browser console and run:

```js
import { auditTouchTargets } from '@/a11y'
auditTouchTargets()
```

Or target a specific section:

```js
auditTouchTargets('#bottom-nav')
auditTouchTargets('.modal-content')
```

### iOS / Android Physical Testing

Test on real devices, not simulators — simulator touch targets often feel different.

Minimum sizes:
- **WCAG 2.5.8 AA (2024):** 24×24px hard floor, 44×44px target
- **Apple HIG:** 44×44pt minimum
- **Android Material:** 48×48dp minimum

---

## Reduced Motion Testing

### macOS
System Settings → Accessibility → Display → Reduce Motion ✓

### iOS
Settings → Accessibility → Motion → Reduce Motion ✓

### Windows
Settings → Ease of Access → Display → Show animations ✗

### CSS override (dev testing)

Add to browser devtools:
```css
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

### What to verify

- [ ] No page content shifts or jumps unexpectedly
- [ ] All information is still conveyed (no animation-dependent meaning)
- [ ] Framer Motion components display their final state immediately
- [ ] Loading spinners still appear (they use a static replacement)
- [ ] Skip links and focus rings still animate (CSS transition: none is applied only to keyframes)

---

## Color Contrast Testing

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Elements → Color picker → Contrast ratio

### Minimum Ratios (WCAG 1.4.3 / 1.4.6)
| Text size | AA ratio | AAA ratio |
|---|---|---|
| Normal text (< 18pt / 14pt bold) | 4.5:1 | 7:1 |
| Large text (≥ 18pt or 14pt bold) | 3:1 | 4.5:1 |
| UI components / icons | 3:1 | — |

### Non-Color Indicators (WCAG 1.4.1)

Every status that uses color must also use a second indicator (icon, pattern, text):

| Component | Color | Non-color indicator |
|---|---|---|
| `AIBadge` confidence | Green/Yellow/Gray | Icon (CheckCircle2 / AlertCircle / MinusCircle) |
| `Badge` status | Multiple | Optional icon via `showIcon` prop |
| `EnergyToggle` | Multiple | Emoji icon + text label |
| `ActionCard` energy | Border color | SR-only energy label in aria-label |
| BottomNav badge | Blue / Amber | SR-only count text |

---

## Keyboard Navigation Testing

### Navigate the full app using only keyboard:

1. Open the app in Chrome
2. Press **Tab** — first stop should be the skip link
3. Press **Enter** on skip link — focus jumps to `#main-content`
4. **Tab** through all interactive elements on the page
5. Verify every interactive element is reachable
6. Verify focus order is logical (left-to-right, top-to-bottom)
7. Verify no focus traps except inside open dialogs
8. Open a modal → verify focus enters modal and cannot leave until Escape

### Checklist

- [ ] Skip link is first Tab stop
- [ ] All buttons and links reachable via Tab
- [ ] All form inputs reachable and usable via keyboard
- [ ] No keyboard traps outside of intentional dialog traps
- [ ] Focus indicator visible on all interactive elements
- [ ] Escape closes modals and returns focus to trigger element
- [ ] Task cards have keyboard-accessible complete button (invisible overlay button)

---

## Reporting Violations

When you find a new accessibility issue:

1. Note the **WCAG success criterion** (e.g., 1.4.3 Contrast Minimum)
2. Note the **severity** (critical / high / medium / low)
3. Note the **affected component and page**
4. Open an issue tagged `accessibility`

Use the severity definitions from the Gate 0 audit:
- **Critical:** Blocks AT users completely
- **High:** Significantly degrades experience
- **Medium:** Causes confusion or extra effort
- **Low:** Minor inconvenience
