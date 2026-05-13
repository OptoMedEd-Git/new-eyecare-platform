# Scripts

## bulk-import-questions.ts

Imports quiz questions from a JSON file into the database (`quiz_questions` + `quiz_question_choices`). Uses the **service role** key to bypass RLS; intended for local/offline batch use only.

### Setup (one-time)

1. Add to `.env.local` (never commit this file; `.gitignore` already covers `.env*`):

   - `NEXT_PUBLIC_SUPABASE_URL` — same as for Next.js
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Studio → **Settings** → **API** → `service_role` **secret** (not the anon key)
   - `BULK_IMPORT_AUTHOR_ID` — UUID of the author; Supabase **Authentication** → **Users** → your user → **UID** (must match a row in `profiles` if your DB enforces it)

2. Install runtime for the script (already in `devDependencies` if you pulled latest):

   ```bash
   npm install
   ```

### Usage

```bash
npx tsx scripts/bulk-import-questions.ts <json-file-path>
npx tsx scripts/bulk-import-questions.ts <json-file-path> --dry-run
npx tsx scripts/bulk-import-questions.ts <json-file-path> --publish
```

By default, questions are created as **drafts**. Use `--publish` to set `status = published` and `published_at` immediately. Use `--dry-run` to validate JSON and category names against `blog_categories` **without** inserting rows.

### Input format

See `scripts/sample-questions.json` for the expected shape. Each object must include:

- `vignette` — string or `null` (optional)
- `question_text` — required
- `choices` — exactly **4** objects, each with `text` and `is_correct` (boolean); exactly **one** must be `true` (`letter` is optional metadata)
- `explanation` — required
- `category` — display **name** matching a row in **`blog_categories.name`** (e.g. `"Glaucoma"`, `"Diagnostics & Imaging"`), not a UUID
- `audience` — one of: `student`, `resident`, `practicing`, `all`
- `difficulty` — one of: `foundational`, `intermediate`, `advanced`
- `image_suggestion` — optional; informational only (images are added later in the CMS)

### Workflow with the quiz authoring chat

1. Use the quiz authoring assistant to produce an array of questions as JSON.
2. Save the output as e.g. `glaucoma-batch-2026-05-10.json`.
3. Run `npx tsx scripts/bulk-import-questions.ts ./glaucoma-batch-2026-05-10.json --dry-run` first.
4. Run without `--dry-run` to import drafts.
5. Review in **Admin → Quiz bank**, attach images if needed, then publish individually or re-run import with `--publish` only when appropriate.

### Security

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or commit it.
- Prefer drafts + CMS review over `--publish` for bulk imports unless you fully trust the JSON.

## bulk-import-flashcards.ts

Imports flashcards from a JSON array into the `flashcards` table (no choices). Uses the **service role** key to bypass RLS; intended for local or controlled batch use only.

### Setup

Same env vars as quiz bulk import: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BULK_IMPORT_AUTHOR_ID` in `.env.local`.

### Usage

```bash
npx tsx scripts/bulk-import-flashcards.ts scripts/sample-flashcards.json --dry-run
npx tsx scripts/bulk-import-flashcards.ts scripts/sample-flashcards.json
npx tsx scripts/bulk-import-flashcards.ts scripts/sample-flashcards.json --publish
```

Default status is **draft**. Use `--publish` to set `status = published` and `published_at` immediately. `--dry-run` validates JSON and category names against `blog_categories` without inserting.

### Input format

Each object requires:

- `front` — required, max 500 characters
- `back` — required, max 1000 characters
- `category` — display **name** matching **`blog_categories.name`** (e.g. `"Glaucoma"`, `"Diagnostics & Imaging"`)
- `audience` — one of: `student`, `resident`, `practicing`, `all`
- `difficulty` — one of: `foundational`, `intermediate`, `advanced`

Optional fields (same semantics as quiz question images in the CMS):

- `image_url` — string or omitted/`null`; must be an `http(s)://` URL or a path starting with `/` when present
- `image_attribution` — string or omitted/`null`; optional credit line (max 500 characters), shown with the image in review

See `scripts/sample-flashcards.json` for examples (including one card with an image).
