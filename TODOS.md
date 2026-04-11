# TODOS

## P1 - Near-term

### CI/CD Pipeline for Auto-Builds
- **What:** GitHub Actions workflow that auto-deploys web to Vercel on push and triggers EAS Build on tag/release
- **Why:** Manual builds don't scale past hackathon. Need automated APK generation for distribution.
- **Effort:** M (human: ~3 days) -> with CC: S (~30 min)
- **Depends on:** GitHub repo configured
- **Added:** 2026-04-10 via /plan-ceo-review

## P2 - Post-hackathon polish

### RPC Caller Check for get_plan_stats
- **What:** Add `auth.uid()` participant check to `get_plan_stats` SECURITY DEFINER RPC so it only returns stats for plans the caller participates in
- **Why:** Currently accepts any plan_id array, leaking aggregate stats (participant count, pending tasks, expenses) for plans the caller doesn't own. UUID guessing is impractical but it's a data hygiene issue.
- **Effort:** S (human: ~30 min) -> with CC: S (~5 min)
- **Depends on:** `get_plan_stats` RPC deployed (from hackathon distribution plan)
- **Added:** 2026-04-11 via /plan-eng-review

### Dark Mode Toggle
- **What:** Add system/light/dark theme switching with CSS variables for the web app
- **Why:** Shows design attention, expected by modern web users. Accessibility improvement.
- **Effort:** M (human: ~2 days) -> with CC: S (~20 min)
- **Depends on:** Web app deployed
- **Added:** 2026-04-10 via /plan-ceo-review
