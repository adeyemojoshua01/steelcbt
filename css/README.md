# `/css` — Stylesheets

Two files, loaded in this order in `index.html`:

```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/theme-aurora.css">
```

**Order matters.** `theme-aurora.css` contains `!important` overrides designed to beat the base rules. Load it **second**.

## `style.css` (base styles)

**What it contains:**

- `.blink-btn` — the pulsing "View in full screen" button that appears on explanation boxes
- `@keyframes blink-pulse` — the pulse animation for that button
- `@keyframes scaleUp` — the modal open animation
- `#fullscreen-explain-modal` — the full-screen explanation modal container, backdrop, positioning
- `.modal-content` — the modal body, max size, scroll
- `.close-btn` / `.theme-toggle-btn` — the two circular buttons in the modal top-right
- `.theme-white` / `.theme-dark` / `.theme-sepia` — three color themes for the modal body (light, dark, parchment)

**What it does NOT contain:**

Layout for the image gallery, note cards, question navigator grid, notification toast, or the exam screen. Those rely on Tailwind utility classes (CDN-loaded) for layout, with colors coming from `theme-aurora.css`.

**Why it's so short:**

Tailwind (loaded from CDN in `index.html`) supplies nearly all structural CSS via utility classes on the HTML elements. This file only holds the few custom structures that Tailwind can't express easily — the blink animation, and the three-theme explanation viewer.

If you ever replace the Tailwind CDN with a pre-compiled build, you will need to move all the utility-class styling into this file. Until then, treat `style.css` as "the exceptions file."

## `theme-aurora.css` (dark theme overlay)

**What it contains:**

A complete dark theme called **Aurora Obsidian**. It does not introduce new classes — it **remaps** the Tailwind color utility classes already used in the app (`bg-white`, `bg-gray-100`, `text-gray-800`, `bg-green-600`, `bg-blue-600`, etc.) into the Aurora palette using `!important`.

**Why this design:**

The HTML uses light-mode Tailwind class names (`bg-white`, `text-gray-800`). Rather than editing every JS template string to use dark names, this file redefines what those names *mean*. So `bg-white` becomes dark ink `#0F1729`, `text-gray-800` becomes near-white `#EAF0FB`, and so on.

**Palette families:**

| Family | Range | Used for |
|---|---|---|
| Ink | `#05070F` → `#33456A` | neutral backgrounds |
| Teal | `#5EEAD4` → `#115E59` | brand green / study mode / correct-answer feedback |
| Amber | `#FCD34D` → `#D97706` | CTAs / current-question / explanation boxes |
| Violet | `#C4B5FD` → `#7C3AED` | image / reference buttons |
| Rose | `#FDA4AF` → `#9F1239` | errors / incorrect answers |
| Emerald | `#34D399` → `#10B981` | "correct option" highlight |

**Sections in the file (each one is a numbered block):**

1. Canvas — `html`, `body`, `header`
2. Surfaces — `bg-*` background colors
3. Text — `text-gray-*` foreground colors
4. Borders — `border-gray-*` colors
5. Teal family — `green-*` (brand, study, correct)
6. Amber family — `blue-*` (primary CTA, "current")
7. Violet family — `purple-*` (media, reference)
8. Rose family — `red-*` (danger, incorrect)
9. Warning — `yellow-*` (yellow toasts)
10. Hover states — all `hover:*` overrides
11. Form controls — `input`, `select`, `textarea`, `.cbt-radio`
12. Study feedback — `.explanation-box`, `.correct-option-highlight`, `.wrong-answer-selected`, `.fill-correct-highlight`, `.study-option:hover`
13. Note cards — `.note-card`, `.note-content`, `.topic-note-badge`
14. Image viewer — `.image-gallery`, `.image-toolbar`, `.image-item`
15. Fullscreen explanation modal theme overrides — boosted specificity so they beat the base
16. Blink button — boosted specificity so it beats `style.css`
17. Scrollbars + layout guards — force `#app-container` to not overflow the viewport; fix mobile address-bar overlap

**Tuning color intensity:**

Study-mode feedback and toasts use `rgba()` with an alpha at the end (e.g. `rgba(20,184,166,.10)`). Raise the alpha to deepen the color without changing its hue. The `.10 .. .18` range gives a subtle tint; `.50 .. .65` gives a solid, readable surface.

**Do not blindly raise alpha to `1.0`.** That loses the glassy Aurora feel. Stick to `.50 .. .65` for readability, `.10 .. .20` for subtle backgrounds.

**How to change the theme:**

1. Modify the `:root` variables at the top of this file
2. Reload — the whole app re-colors
3. Do **not** touch the class selectors (`bg-white`, `text-gray-800`, etc.) — those names are tied to the Tailwind classes in the HTML and JS. Only their **values** should change.
