# CRATEDIGGERS deployment handoff

Current status:

- Product source changes for CREATE simplification are present in this workspace.
- Local production build passes.
- Sites deployment checkout has one local commit ready:
  - `6d5b4225117357c872832f5803e844f924e33975`
  - message: `Simplify create template selection`
- The commit is not pushed to the Sites remote yet because the Sites source repository credential is unavailable/expired in the current Codex session.
- Deployment-ready archive exists:
  - `C:\Users\hjw06\.codex\visualizations\2026\07\19\019f7a33-01eb-7f30-927f-11699c842669\cratediggers-6d5b422.tgz`
- Local Git bundle backup exists:
  - `C:\Users\hjw06\OneDrive\문서\Cratediggers\cratediggers-sites-deploy-6d5b422.bundle`

Sites project:

- `appgprj_6a5cb42cd99c81918b291d5ae499d1c3`
- public URL: `https://cratediggers-music.hjw0602.chatgpt.site/`

Next deployment attempt:

1. Obtain a fresh Sites source repository write credential.
2. Push `main` from:
   - `C:\Users\hjw06\.codex\visualizations\2026\07\19\019f7a33-01eb-7f30-927f-11699c842669\existing-site-repo`
3. Save a Sites version using commit `6d5b4225117357c872832f5803e844f924e33975` and the archive above.
4. Deploy the saved version privately.
5. Confirm `/create` shows only:
   - Classic Grid
   - Display Shelf
   - Crate Pile

