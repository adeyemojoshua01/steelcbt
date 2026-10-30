# University eduCBT

A fully client-side Computer-Based Test (CBT) application for students. It runs a **practice** exam with a live timer, or a **study** mode where answers reveal themselves as the student clicks. Objective (MCQ), fill-in-the-gap, and open-ended theory questions are all supported. Theory answers may be typed or photographed, and are graded automatically by a Groq AI model through a Vercel serverless function.

## What students see

- A landing page with all available subjects and study notes
- Candidate login (name, subject, topic mix, custom timer)
- An exam interface with a live timer, question navigator, image reference panel, per-topic notes, and per-topic images
- Immediate feedback in study mode (correct answer highlighted, full explanation shown)
- A score screen, full answer review, and a verse popup

There is no backend database yet. All data (subjects, questions, notes, results) lives in the browser's `localStorage`. AI grading is the **only** network call the app makes, via `/api/ai-brain`.

## How the files are organised

```text
index.html                    ← single HTML entry point
/css/                         ← two stylesheets (base + theme)
/js/                          ← all application JavaScript
/question-banks/              ← question data + loader
/api/                         ← Vercel serverless function
```

## `index.html` (this folder)

The **only** HTML page in the project. Nothing else is a page — every screen (landing, login, exam, results, review) is rendered dynamically into `<main id="app-container">` by JavaScript.

**What it contains:**

- `<head>`: meta tags for mobile PWA behaviour, Tailwind CDN, Font Awesome CDN, MathJax config + CDN, Tesseract CDN
- `<header>`: brand + dynamic `#header-actions` slot that JS rewrites per screen (Home button / Images button / timer)
- `<main id="app-container">`: the app renders here
- Six modal skeletons:
  - `#mobile-grid-modal` — question navigator (mobile)
  - `#image-modal` — reference image viewer
  - `#topic-image-modal` — per-topic image viewer
  - `#note-viewer-modal` — per-topic notes viewer
  - `#fullscreen-explain-modal` — full-screen explanation viewer
- Eleven `<script src>` tags at the bottom, in **strict order**. Every local script uses `defer` so they execute in document order after parsing. **Reordering these will break the app.**

**Script load order (do NOT change):**

| # | File | Purpose |
|---|---|---|
| 1 | `js/image-viewer.js` | primitives + image modal |
| 2 | `js/app-core.js` | creates `window.app` |
| 3 | `js/app-exam.js` | extends: exam methods |
| 4 | `js/app-ai.js` | extends: AI + `submitTest` |
| 5 | `js/app-results.js` | extends: results + review |
| 6 | `question-banks/*-bank.js` | each pushes a string |
| 7 | `question-banks/question-loader.js` | parses + imports banks |
| 8 | `js/explanation-viewer.js` | wraps `renderQuestion` etc. |
| 9 | `js/navigation.js` | wraps nav methods |
| 10 | `js/verse-popup.js` | wraps `showVersePopup` |
| 11 | `js/math-formatter.js` | wraps `submitTest` (fetch hijack) |
| 12 | `js/init.js` | boots `app.init()` |

**Why the order matters:**

- `app-core.js` must run before any extenders (3, 4, 5)
- `question-loader.js` must run after every `*-bank.js`
- `explanation-viewer` / `navigation` / `verse-popup` / `math-formatter` each **wrap** a method the earlier files defined — they must run after the definition they wrap
- `init.js` triggers `app.init()` on `DOMContentLoaded`; anything it depends on must already be loaded

## Where to edit what

| Task | File |
|---|---|
| Add a new subject | new file in `question-banks/` |
| Change theme colors | `css/theme-aurora.css` |
| Change base styles | `css/style.css` |
| Fix a bug in the exam | `js/app-exam.js` |
| Fix AI grading | `js/app-ai.js` (client) OR `api/ai-brain.js` (server) |
| Fix results screen | `js/app-results.js` |
| Fix back-button | `js/navigation.js` |
| Fix MathJax on AI text | `js/math-formatter.js` |
| Add Firebase | `js/firebase-config.js` (placeholder) |

## To run locally

Do **not** open `index.html` via `file://` — the AI call to `/api/ai-brain` will fail (CORS). Use a local server:

```bash
npx serve .
# or
python -m http.server 8000
```

Then visit `http://localhost:3000` (or whatever port is printed).

To enable AI grading locally, create a `.env.local` file:

```bash
GROQ_API_KEY=your_key_here
```

and run with Vercel CLI:

```bash
vercel dev
```

## To deploy

```bash
vercel deploy --prod
```

Set `GROQ_API_KEY` in the Vercel dashboard under **Settings → Environment Variables**. Redeploy if the key changes.

## What is not yet implemented

- Firebase Authentication (placeholder only in `js/`)
- Firestore result storage (all results are per-browser)
- Rate limiting on `/api/ai-brain`
- Admin UI for editing subjects or notes in-browser
- Role separation (candidate vs examiner)

See `js/firebase-config.js` for the planned Project 2 roadmap.
