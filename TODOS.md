# TODOS

## P1 - Near-term

### CI/CD Pipeline for Auto-Builds
- **What:** GitHub Actions workflow that auto-deploys web to Vercel on push and triggers EAS Build on tag/release
- **Why:** Manual builds don't scale past hackathon. Need automated APK generation for distribution.
- **Effort:** M (human: ~3 days) -> with CC: S (~30 min)
- **Depends on:** GitHub repo configured
- **Added:** 2026-04-10 via /plan-ceo-review

## P2 - Post-hackathon polish

### Extract Shared TS Package
- **What:** Move settlement.ts, smart-parse.ts, invite.ts, colors.ts, templates.ts, strings.ts, and types/database.ts into a shared npm package importable by both React Native and Next.js
- **Why:** Currently duplicated across two codebases. A bug fix in one requires manual copy to the other.
- **Effort:** M (human: ~3 days) -> with CC: S (~30 min)
- **Depends on:** Web app deployed
- **Added:** 2026-04-10 via /plan-eng-review

### Dark Mode Toggle
- **What:** Add system/light/dark theme switching with CSS variables for the web app
- **Why:** Shows design attention, expected by modern web users. Accessibility improvement.
- **Effort:** M (human: ~2 days) -> with CC: S (~20 min)
- **Depends on:** Web app deployed
- **Added:** 2026-04-10 via /plan-ceo-review
