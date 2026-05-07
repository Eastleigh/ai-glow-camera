---
name: testing-expo-web
description: Test the AI Glow Camera app via Expo Web. Use when verifying UI rendering, navigation, or screen layout changes.
---

# Testing AI Glow Camera via Expo Web

## Setup

1. Install dependencies (may need `--legacy-peer-deps` due to React 19 peer dep conflicts):
   ```bash
   npm install --legacy-peer-deps
   ```

2. Install web platform dependencies (not included by default in Expo):
   ```bash
   npx expo install react-dom react-native-web
   ```

3. Start Expo Web dev server:
   ```bash
   npx expo start --web --port 8082
   ```
   If port 8082 is taken, the CLI will prompt to use the next available port.

4. Verify the server is running:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:8082
   ```
   Should return `200`.

## Navigation Flow

The app uses expo-router (file-based routing). Key screens:

- **`/`** — Splash screen (auto-redirects after 1.5s)
- **`/login`** — Login form (Email, Password, Sign In, Sign Up link, "Skip for now →")
- **`/signup`** — Sign Up form (Name, Email, Password, Referral Code, Create Account)
- **`/camera`** — Camera tab (shows "Camera Access Needed" on web since browser camera requires permission grant)
- **`/gallery`** — Gallery tab (shows "No generations yet" empty state without backend)
- **`/profile`** — Profile tab (Guest User, 3 Credits, Free Plan, referral section, settings)
- **`/pricing`** — Pricing modal (Free / Premium $9.99 / Pro $29 tiers)
- **`/transform`** — Transform style selection (requires `?photoUri=` query param)
- **`/result`** — Result screen (requires `?generationId=` query param)

## Testing Without Backend

The app requires Supabase for auth and AI generation. Without a configured Supabase project:
- Auth forms render but sign-in/sign-up will fail
- Camera capture works (if browser permission granted) but upload will fail
- Transform/result screens need query params from the generation flow
- Gallery will show empty state
- Profile shows default guest state (3 credits, Free plan)

UI-only testing covers: splash, login, signup, camera permission screen, gallery empty state, profile, pricing tiers, and admin dashboard.

## Admin Dashboard

The admin dashboard is a standalone static HTML file:
```
admin/index.html
```
Open directly in browser via `file://` path or serve it. It has its own Supabase login (separate from the mobile app auth). Without Supabase credentials, you can verify the login form renders correctly.

## TypeScript Check

```bash
npx tsc --noEmit
```

## Known Issues

- `expo-camera` on web shows a permission request screen; the browser may block camera access in non-HTTPS contexts
- `expo-haptics` is no-op on web (wrapped in `Platform.OS !== 'web'` checks)
- The Sign Up page does not have a "Skip for now" link (only the Login page does)
- `--legacy-peer-deps` may be needed due to React 19 peer dependency conflicts with some Expo packages

## Devin Secrets Needed

For full end-to-end testing (beyond UI-only):
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous/public key
- `REPLICATE_API_TOKEN` or `FAL_KEY` or `OPENAI_API_KEY` — At least one AI provider key (set in Supabase Edge Function secrets)
