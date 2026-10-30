# `/question-banks` — Question Data + Loader

Two kinds of file live here:

- `*-bank.js` — question data, one per subject (or per discipline — see "Adding a new bank")
- `question-loader.js` — the parser that reads them and imports them into `app.data.subjects`

**Load order in `index.html` (strict):**

```html
<script src="question-banks/probability-bank.js" defer></script>
<script src="question-banks/linear-algebra-bank.js" defer></script>
<!-- ... any other *-bank.js files ... -->
<script src="question-banks/question-loader.js" defer></script>   <!-- LAST -->
```

The loader **must** be the last question-related script. If any bank loads after the loader, its questions will be silently ignored (the loader has a 5-second retry that helps, but misordering causes a visible flash on first load — keep the loader last).

## Bank file format

A bank file is two lines of ceremony + one big template literal:

```javascript
window.CBT_SUBJECT_BANKS = window.CBT_SUBJECT_BANKS || [];
window.CBT_SUBJECT_BANKS.push(`
...your question text here...
`);
```

Inside the template literal, the parser recognises these directives (all case-insensitive):

| Directive | Meaning |
|---|---|
| `Subject: <name>` | start a new subject |
| `Topic: <name>` | start a new topic in the subject |
| `Type: MCQ \| Theory \| Fill` | start a new question |
| `Q###: <question text>` | the question body |
| `Option: A: <text>` | an MCQ option (A/B/C/D) |
| `Answer: <value>` | MCQ letter, Fill text, or Theory ignores this (use Explanation as model answer) |
| `Marks: <number>` | Theory only (default `10`) |
| `Explanation: <text>` | the model answer / explanation. Multi-line continuation is OK. |

Blank lines and `===` lines are ignored. Everything between one directive and the next is captured accordingly.

> **Rule:** A continuation line inside `Explanation:` must **not** start with `Subject:`, `Topic:`, `Type:`, `Q###:`, `Option:`, `Answer:`, or `Explanation:`. Those are directives and will terminate the block. Keep explanations free-form after the first line — no leading directive keywords.

## Adding a new bank

1. Create `question-banks/<name>-bank.js` following the format above.
2. Add **one line** to `index.html`, **above** `question-loader.js`:

   ```html
   <script src="question-banks/<name>-bank.js" defer></script>
   ```

3. Reload. The new subject appears on the landing page.

Each bank file may contain **multiple** subjects — just repeat the `Subject:` directive. But **no single subject may be split across two bank files** (see "Merge behaviour" below).

## Merge behaviour (important)

The loader parses all banks as one combined text, then merges into `app.data.subjects` using this rule:

- Subject name **does not exist** yet → **add** it
- Subject name **already exists** → **fully replace** it

That means if you add a second `Subject: Physics I` in a different bank file, the **second one wins** — it overwrites the first. This is by design: edit a subject in one place, reload, and it fully replaces the previous version. But be careful not to accidentally duplicate a subject name.

**Corollary:** a single subject lives in **exactly one bank file**. Always. No exceptions.

## Loaded files

### `probability-bank.js`
- Subject: **Probability I**
- Topics: Probability Space & Theorems, Probability Spacious
- ~3 questions + 1 theory

### `linear-algebra-bank.js`
- Subject: **Linear Algebra**
- Topics: Matrices and Determinants, Systems of Linear Equations, Vector Spaces, Eigenvalues and Eigenvectors
- 40 questions total: 9 MCQ + 1 Fill + 10 MCQ per topic, with 4 theory questions across topics. **Every** question, option, answer and explanation is MathJax-rendered.

### `question-loader.js`
The parser. Reads `window.CBT_SUBJECT_BANKS`, splits it into subjects/topics/questions using the directive grammar above, saves into `localStorage` under `cbt_subjects`, then (if the landing page is already rendered) re-renders it so the new subject appears immediately.

Also does one legacy cleanup: it deletes any subject named **`General Science`** on load (an artefact from an earlier version — safe to remove that block if you never had one).

## MathJax in banks — backslash doubling

Bank text lives inside a JavaScript **template literal**. In a template literal, `\` is an escape character. So every literal backslash you want MathJax to receive must be **doubled**:

| MathJax needs | Write in bank file |
|---|---|
| `\(` | `\\(` |
| `\)` | `\\)` |
| `\lambda` | `\\lambda` |
| `\begin{pmatrix}` | `\\begin{pmatrix}` |
| `\\` (matrix row break) | `\\\\` |

If MathJax renders literally as `\(x\)` instead of a formula, you missed a doubling. Fix the bank, reload.

## Where the data goes

On load, the parsed subjects are saved to `localStorage` under the key `cbt_subjects`. From then on, the app reads from `localStorage`, not from the bank files. If you **edit** a bank file and reload, the loader re-parses the bank, overwrites the subject in `localStorage`, and re-renders — so bank edits do propagate on reload.

**BUT:** if a user manually adds questions through an admin UI (in the future), those live only in `localStorage` and will be **overwritten** the next time the bank file loads. There is no per-question merge — replace is all-or-nothing per subject.

For per-question persistence across reloads, you need Firestore (Project 2).
