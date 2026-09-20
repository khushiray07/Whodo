# Whodo

Group planning for shared tasks, expenses, and accountability.

Whodo helps groups move coordination out of scattered chats and into one shared plan. It lets friends, flatmates, event teams, or trip groups create a plan, assign responsibilities, track shared expenses, and see who needs to do or pay what.

## Key Features

- Create custom plans or start from templates for birthdays, trips, chores, hackathons, and dinners.
- Add participants, invite others with a code, link, QR code, or WhatsApp share flow.
- Create, claim, assign, edit, complete, and comment on tasks with deadlines.
- Use smart task input to parse assignees, INR amounts, and simple deadlines from plain text.
- Track expenses on tasks with equal or custom weighted splits.
- View settlement recommendations, expense summaries, activity history, and alerts.
- Manage profiles with avatar uploads and basic plan/task stats.

## Tech Stack

- Expo 54 and React Native 0.81
- React 19 and TypeScript
- Expo Router 6
- Supabase Auth, Postgres, Realtime, Storage, RPCs, and Edge Functions
- React Native Web for web output
- Expo Notifications, SecureStore, Image Picker, Clipboard, and Linking
- Vercel web export and EAS build configuration

## Screenshots / Demo

No screenshots are committed yet.

Demo seed scripts are available in `scripts/seed-goa.sql` and `scripts/seed-demo.sql` for populating sample Supabase data.

## How to Run Locally

Install dependencies:

```bash
npm install
```

Create a `.env` file with the Supabase public client values:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Apply the SQL migrations in `supabase/migrations` to your Supabase project in order. Optional demo data can be loaded from `scripts/`.

Start Expo:

```bash
npm start
```

Or run a specific target:

```bash
npm run web
npm run ios
npm run android
```

## Project Structure

```text
app/                 Expo Router screens and route groups
components/          Reusable React Native UI components
hooks/               Supabase-backed data hooks
lib/                 Auth, invite, parsing, settlement, export, and push helpers
supabase/migrations/ Database schema, RLS policies, RPCs, and triggers
supabase/functions/  Supabase Edge Function for Expo push notifications
scripts/             Demo seed SQL
```

## Future Improvements

- Add CI/CD for Vercel web deploys and EAS mobile builds.
- Add system/light/dark theme support.
- Add automated tests for settlement logic, invite flows, and Supabase RPC behavior.
