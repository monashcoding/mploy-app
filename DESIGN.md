# Design System Document: High-End Editorial Job Board

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Curator"**

This design system rejects the "commodity" look of traditional job boards. It is built on the principle of **Architectural Curation**—treating job listings not as database entries, but as editorial features. By utilizing high-contrast typography, intentional asymmetry, and deep tonal layering, we create a workspace that feels authoritative, premium, and calm. 

The system breaks the "template" aesthetic by favoring breathing room over density and using light as a functional tool rather than just an aesthetic choice. It is designed for the high-performing professional who values efficiency through visual clarity.

---

## 2. Colors
Our palette is anchored in deep obsidian tones, punctuated by a high-energy primary yellow that acts as a beacon for action.

*   **Primary Palette:** 
    *   `primary`: #ffdd73 (High-energy yellow for core actions)
    *   `on-primary`: #624e00 (Deep contrast for legibility on yellow)
    *   `background`: #0e0e0e (Deep charcoal/black foundation)
*   **Surface Hierarchy:** 
    *   `surface-container-low`: #131313
    *   `surface-container`: #1a1a1a
    *   `surface-container-high`: #20201f
*   **Status Indicators:**
    *   `Applied`: Blue (via `tertiary` logic)
    *   `Accepted`: Green
    *   `Error`: #ff7351 (`error`)

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Structural boundaries must be achieved through **Background Color Shifts**. For example, a `surface-container-high` card sits on a `surface-container-low` background. This creates a "shadow-less" depth that feels modern and integrated.

### The "Glass & Gradient" Rule
To elevate the experience, floating headers or navigation bars should use **Glassmorphism**. Use semi-transparent surface colors with a `backdrop-blur(20px)`. Main CTAs should utilize a subtle linear gradient from `primary` to `primary-dim` to provide a tactile, "lit-from-within" feel.

---

## 3. Typography
We use a dual-typeface system to balance editorial authority with functional utility.

*   **Display & Headlines (Manrope):** These are the "Editorial" voice. Use `display-lg` (3.5rem) for hero sections and `headline-md` (1.75rem) for section titles. Bold weights are mandatory for headers to maintain the high-contrast signature look.
*   **Body & Labels (Inter):** These are the "Functional" voice. `body-md` (0.875rem) is the workhorse for job descriptions. Inter’s high x-height ensures maximum legibility against dark backgrounds.
*   **Hierarchy as Identity:** Use `title-lg` (1.375rem) for job titles in lists. The scale jump between headlines and body text is intentional—it mimics luxury magazine layouts, guiding the eye to the most critical information first.

---

## 4. Elevation & Depth
Depth in this system is a result of light physics, not artificial decoration.

*   **Tonal Layering:** Always stack from darkest to lightest.
    *   *Level 0:* `surface` (Main background)
    *   *Level 1:* `surface-container-low` (Content sections)
    *   *Level 2:* `surface-container-highest` (Interactive cards/modals)
*   **Ambient Shadows:** If an element must "float" (like a Toast or Floating Action Button), use a shadow with a blur radius of at least `24px` and an opacity no higher than `8%`. Use a tinted shadow (blending `on-surface` with the background) to avoid a "dirty" grey appearance.
*   **The "Ghost Border" Fallback:** If high-density data requires containment, use a **Ghost Border**. Apply `outline-variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` fill, `on-primary` text. Radius: `md` (0.75rem). Bold `label-md` text.
*   **Secondary:** Ghost style. `outline` border (20% opacity) with `on-surface` text.
*   **Glass Action:** Semi-transparent `surface-bright` with backdrop blur for secondary utility actions.

### Chips (Status & Tags)
*   **Status Chips:** Use a muted version of the status color for the background (e.g., 20% opacity) with a high-contrast and solid text.
*   **Filter Chips:** Use `surface-variant` with a radius of `full` (9999px) for a soft, pill-shaped aesthetic.

### Cards & Lists
*   **Rule:** Forbid the use of divider lines.
*   **Separation:** Use `spacing-8` (2rem) of vertical white space or shift the `surface-container` tier. 
*   **Interactive Cards:** On hover, a card should transition from `surface-container-low` to `surface-container-high`.

### Input Fields
*   **Style:** Minimalist. No bottom border. Use a `surface-container-highest` background with a subtle radius of `sm` (0.25rem). 
*   **Active State:** The border should only appear on focus, using a 1px `primary` line.

### Job Specific: "Quick-Action" Bar
A specialized component for the job board—a sticky footer or side-rail for "Apply Now" and "Save" actions using the **Glassmorphism** rule to keep the user grounded in the content while providing immediate utility.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical spacing to create visual interest (e.g., more padding on the left than the right in editorial headers).
*   **Do** use `primary` yellow sparingly. It is a "laser pointer," not a bucket of paint.
*   **Do** ensure all text on dark backgrounds meets a minimum 4.5:1 contrast ratio for accessibility.

### Don't:
*   **Don't** use 100% opaque, high-contrast borders. They "trap" the content and break the fluid editorial feel.
*   **Don't** use standard "Drop Shadows" (0, 2, 4, 0). They look dated and cheap.
*   **Don't** use dividers between list items. Trust the white space and background shifts to do the work.
*   **Don't** mix the font roles. Never use Manrope for body copy; it’s too "loud" for long-form reading.