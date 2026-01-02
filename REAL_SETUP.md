# Making NGINE fully real (Supabase, Storage, AI, Ads)

This file contains a concise checklist and commands to make the app real end-to-end.

1) Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- Note the Project URL and the anon (public) API key.

2) Apply the DB schema and storage policies
- Open SQL editor and run the contents of `supabase/schema.sql`.
- Run the contents of `supabase/storage-setup.sql` to create `goal-proofs` bucket and RLS policies.

3) Add environment variables
- Create a `.env` file at project root (`Ngine/Ngine/.env`) with:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key-here
EXPO_PUBLIC_OPENAI_KEY=your_openai_key_here  # optional for AI insights
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-...     # optional
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-...   # optional
```

- Never commit the `.env` file to version control.

4) (Optional) Use service role key to automate SQL & storage creation
- Only use this from a secure machine, not in the app.
- With a service role key you can run `supabase` CLI commands or use the SQL editor to run `supabase/schema.sql` and `supabase/storage-setup.sql`.

5) Verify connection locally
- Install deps and start Expo:
  - npm install
  - npx expo start --web
- Use the helper script to test the Supabase connection:
  - In the `Ngine/Ngine` directory: `node scripts/check_supabase.js`

6) Switch ProofGallery to real uploads
- Once env vars are set and bucket exists, the gallery will automatically use `database.uploadGoalProof()` (already implemented).
- Test uploading an image in the app; verify file shows in the `goal-proofs` bucket and DB record exists in `goal_proofs`.

7) Edge Functions & AI
- Ensure the AI edge function has `OPENAI_API_KEY` set in its environment (Supabase Functions settings).
- Test AI insight via the app flow (watch ad → generate insight) or by calling the edge function directly.

8) Ads
- Provide AdMob IDs to `EXPO_PUBLIC_ADMOB_BANNER_ID` and `EXPO_PUBLIC_ADMOB_REWARDED_ID`.
- Validate reward and banner behavior on a real device.

9) After E2E success
- Add integration tests if desired.
- Commit changes to a feature branch and open a PR.

If you'd like, I can run steps 2–6 for you if you provide a temporary Supabase service role key and the OpenAI key. Otherwise I can provide step-by-step commands for you to run in the Supabase SQL editor.
