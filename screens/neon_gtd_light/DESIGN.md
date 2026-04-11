# Design System Specification: High-End Productivity & Luminous Clarity

## 1. Overview & Creative North Star
**The Creative North Star: "The Luminous Curator"**

This design system rejects the "flatness" of standard productivity tools in favor of a layered, editorial experience. It is designed to feel like a high-end digital atelier—clean, airy, and hyper-organized, yet possessing a soulful "glow." 

The "Luminous Curator" breaks the traditional grid through **intentional asymmetry** and **tonal depth**. Instead of rigid boxes, we use white-on-white layering, light blurs, and sophisticated glassmorphism to create a sense of physical space. Elements don’t just sit on a page; they float in a pressurized environment of light. This is high-end GTD (Getting Things Done) translated into a visual language of focus and premium intent.

---

## 2. Colors & Surface Philosophy

The palette is anchored in a pristine white base, energized by a grounded teal (`primary`) and a vibrating electric purple (`secondary`).

### The Color Tokens
*   **Background:** `#F8F9FA` (The Canvas)
*   **Primary:** `#006B5C` (Refined Teal for high-contrast legibility)
*   **Primary Container:** `#00BFA5` (The Signature Glow)
*   **Secondary:** `#8234C6` (Electric Purple Accent)
*   **Surface:** `#F8F9FA`
*   **Surface Container Lowest:** `#FFFFFF` (The purest white for top-layer cards)

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through **background color shifts**. To separate a sidebar from a main content area, do not draw a line; instead, set the sidebar to `surface-container-low` and the main stage to `surface`. The 0.35rem (Token 1) shift in tone is enough for the eye to perceive structure without visual clutter.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers. 
*   **Level 0 (Background):** `surface` (`#F8F9FA`)
*   **Level 1 (Sections):** `surface-container-low` (`#F3F4F5`)
*   **Level 2 (Cards/Content):** `surface-container-lowest` (`#FFFFFF`)

### The "Glass & Gradient" Rule
To elevate the experience, use **Backdrop Blur (20px - 40px)** on floating navigation bars or modal overlays. Combine this with `surface-container-lowest` at 80% opacity. 
*   **Signature Texture:** Main Action Buttons should not be flat. Apply a subtle linear gradient from `primary` (`#006B5C`) to `primary-container` (`#00BFA5`) at a 135° angle to create a "lit from within" effect.

---

## 3. Typography: The Editorial Voice

We use **Manrope** exclusively. Its geometric yet approachable form factor provides the "High-End Productivity" vibe.

*   **Display (Extrabold):** Used for high-impact motivation or daily overviews. Large tracking (e.g., -0.02em) keeps it feeling tight and expensive.
*   **Headlines (Bold):** These serve as the "anchors" of the page. Use `on-surface` for maximum authority.
*   **Title (Medium/Semi-bold):** Balanced for card titles and section headers.
*   **Body (Medium):** The workhorse. Never use "Regular" weight; "Medium" (500) ensures the typeface holds its ground against the bright backgrounds.
*   **Labels (Bold):** All-caps labels with +0.05em letter spacing should be used for metadata to create an "architectural" feel.

---

## 4. Elevation & Depth: Tonal Layering

We move away from the "shadow-heavy" look of the 2010s. Depth is achieved via **Tonal Stacking**.

*   **The Layering Principle:** A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural lift. This is our primary method of elevation.
*   **Ambient Shadows:** For elements that truly "float" (like a Task Creation FAB), use a hyper-diffused shadow: `box-shadow: 0 12px 40px rgba(0, 107, 92, 0.06);`. Note the use of the `primary` color in the shadow—this creates a "soft glow" rather than a dirty grey smudge.
*   **The Ghost Border:** If high-contrast accessibility is required, use a 1px border with `outline-variant` at **15% opacity**. It should feel felt, not seen.
*   **Glassmorphism:** Use `backdrop-filter: blur(12px)` on any element that overlaps content. This maintains the "Airy" vibe while ensuring text remains readable.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (`primary` to `primary-container`), `rounded-md` (0.75rem), White text.
*   **Secondary:** Ghost style. Transparent background with a `primary` border at 20% opacity. 
*   **Tertiary:** No container. `secondary` (Purple) text for "soft" actions like 'Cancel' or 'Draft'.

### Cards & Lists
*   **Strict Rule:** No dividers. Use `spacing-4` (1.4rem) to separate list items.
*   **Interactions:** On hover, a card should shift from `surface-container-lowest` to a subtle `primary-fixed` (very light teal) tint, rather than lifting with a heavy shadow.

### Input Fields
*   **Style:** Minimalist. No bottom line. Use a `surface-container-high` background with `rounded-sm`. 
*   **Focus State:** A 2px `secondary` (Purple) "glow" border with a 4px blur.

### Chips (Task Tags)
*   **Design:** `rounded-full`, using `secondary-fixed` (light purple) background with `on-secondary-fixed` (dark purple) text. This provides a pop of color that distinguishes metadata from the main task.

---

## 6. Do’s and Don’ts

### Do:
*   **Use White Space as a Tool:** Use `spacing-10` and `spacing-12` between major sections to let the design breathe.
*   **Embrace Asymmetry:** Align text to the left but allow imagery or secondary cards to "break" the margin to the right for an editorial feel.
*   **Tint Your Greys:** Ensure all neutral surfaces have a hint of blue/teal from the `surface` palette to avoid a "dead" grey look.

### Don’t:
*   **Don’t use 100% Black:** Use `on-surface` (`#191C1D`) for text. Pure black is too harsh for this luminous system.
*   **Don’t use standard Drop Shadows:** If it looks like a default CSS shadow, it’s wrong. It must be wide, soft, and tinted.
*   **Don’t use Divider Lines:** If you feel the need to draw a line, try increasing the padding or shifting the background tone first. Lines are the "clutter" we are removing.