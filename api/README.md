# `/api` — Serverless Functions (Vercel)

Any `.js` file in this folder becomes a serverless endpoint at `/api/<filename>`. Only one file currently exists: `ai-brain.js`.

## `ai-brain.js`

POST endpoint that grades a student's answer using Groq's API.

**Route:** `POST /api/ai-brain`

**Body (JSON, one of two shapes):**

Text grading:

```json
{
  "studentAnswer":   "<typed text>",
  "referenceAnswer": "<model answer / explanation>",
  "maxMarks":        10
}
```

Image grading (handwriting):

```json
{
  "imageBase64":     "data:image/jpeg;base64,...",
  "referenceAnswer": "<model answer / explanation>",
  "maxMarks":        10,
  "isImage":         true
}
```

**Response (JSON, 200 on success):**

```json
{
  "score":         7.5,
  "reason":        "Feedback text",
  "transcription": "Typed text"
}
```

- `score` — number, 0..maxMarks
- `reason` — string
- `transcription` — string; `null` for text mode

**Response (JSON, non-200):**

```json
{ "error": "human-readable message" }
```

**Error codes:**

| Code | Meaning |
|---|---|
| 405 | Method not allowed (only POST) |
| 500 | `GROQ_API_KEY` missing on server, or AI failed, or invalid JSON from AI |

## How it works (high-level)

1. Reads `GROQ_API_KEY` from `process.env`. Fails fast if missing.
2. Fetches the **live** model list from Groq's `/v1/models` endpoint. This avoids hardcoding model names — Groq renames models occasionally and this endpoint adapts automatically.
3. Chooses a model:
   - **Image mode:** prefers a vision-capable model (checks for `qwen`/`llava`/`vision` by ID substring)
   - **Text mode:** prefers `gpt-oss-20b`, `gpt-oss-120b`, `qwen3-32b`
4. Builds a prompt asking the AI to grade the student's answer against the reference answer, returning **ONLY** JSON.
5. POSTs to Groq's `/v1/chat/completions` with `response_format: { type: "json_object" }` to force JSON output.
6. Parses the response. If the AI wrapped the JSON in prose, it extracts the first `{...}` block. If no JSON, throws 500.
7. Returns `{ score, reason, transcription }`.

## Environment variable

| Variable | Required | Where to set |
|---|---|---|
| `GROQ_API_KEY` | Yes | Vercel dashboard → Settings → Env Vars; local dev: `.env.local` (see root README) |

Without it, the endpoint returns:

```json
{ "error": "Groq API key missing in Vercel" }
```

## Security notes

- The endpoint currently has **no auth**. Anyone who knows the URL can call it and burn your Groq quota. Mitigations:
  - Rate limit by IP (Vercel KV or Upstash)
  - Require a shared header `X-App-Token` validated against `process.env`
  - Verify Firebase auth token (Project 2)
- `maxMarks` is **trusted from the client**. A malicious client could send `maxMarks=999999`. The AI is unlikely to award more than the reference answer justifies, but scoring is advisory, not enforced server-side.
- The prompt is vulnerable to **prompt injection** from the `referenceAnswer` or image. This is acceptable for a controlled education deployment but not for hostile users.

## Deploying

```bash
vercel deploy --prod
```

Vercel automatically treats every file in `/api` as a function. No `vercel.json` is needed unless you want a non-default runtime. Node 18+ is used by default, which includes global `fetch` — that is why `ai-brain.js` can call Groq without an HTTP library.
