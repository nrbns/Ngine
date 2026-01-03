## Supabase Integration (CI)

This repository provides a manual GitHub Actions job to validate a Supabase project and run integration tests.

How to enable:

1. Go to GitHub repository Settings -> Secrets -> Actions and add:
   - `EXPO_PUBLIC_SUPABASE_URL` (your Supabase URL)
   - `EXPO_PUBLIC_SUPABASE_KEY` (anon or service role key — prefer a test-only anon key)

2. Run the workflow: Actions -> Supabase Integration Check -> Run workflow (you may pass a branch if needed).

What it does:
- Runs `node scripts/check_supabase.js` to check DB and storage connectivity.
- Optionally runs the `ProofGallery.supabase.test.tsx` test if the env vars are present.

Notes:
- Do not commit service role keys to the repo; use GitHub Secrets.
- Integration tests require additional setup (buckets, tables) as documented in the project `REAL_SETUP.md` (if available).