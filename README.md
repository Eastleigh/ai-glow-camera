# ✨ AI Glow Camera

A mobile-first AI camera app that transforms selfies with AI-powered style transformations. Built with React Native (Expo), Supabase, and AI image generation APIs.

**"Open camera → take selfie → choose transformation → AI generates premium result → share instantly."**

## Features

### 📸 Native Camera
- Opens directly into camera mode (front-facing default)
- Tap-to-capture selfie
- Photo gallery import support
- Face guide overlay for perfect framing

### 🎨 AI Transformation Styles
- **Professional Headshot** — Studio-quality corporate portrait
- **Dating Photo** — Warm, attractive dating profile photo
- **Luxury Lifestyle** — Glamorous portrait with luxury backdrop
- **Fitness Glow-Up** — Athletic, energetic transformation (Premium)
- **Influencer Portrait** — Instagram-ready aesthetic
- **Cinematic Portrait** — Movie-quality dramatic portrait (Premium)
- **AI Avatar** — Futuristic digital avatar (Premium)
- **Before/After Glow-Up** — Enhanced best-version transformation (Premium)

### 💳 Credit System & Payments
- **Free tier**: 3 free generations with watermark
- **Premium ($9.99/mo)**: 50 credits, no watermark, HD exports
- **Pro ($29/mo)**: 200 credits, AI video, commercial use, priority

### 📤 Sharing
- Save to camera roll
- Share to Instagram, TikTok, Snapchat
- Share via system share sheet
- Before/after comparison view

### 🔄 Viral Loop
- Referral system (5 free credits per invite)
- "Made with AI Glow Camera" watermark on free tier
- Before/after share templates

### 📊 Admin Dashboard
- User management
- Generation tracking
- Revenue metrics
- API cost monitoring
- Prompt template management
- Style analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo (TypeScript) |
| Camera | expo-camera |
| Auth / DB / Storage | Supabase |
| AI Generation | Replicate / Fal.ai / OpenAI (fallback chain) |
| Backend | Supabase Edge Functions (Deno) |
| Paywall | Superwall (expo-superwall) |
| Payments | Stripe / RevenueCat (ready) |
| Admin | Static HTML + Chart.js |

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with auth
│   ├── index.tsx           # Splash screen
│   ├── transform.tsx       # Style selection
│   ├── result.tsx          # Generation result + sharing
│   ├── pricing.tsx         # Subscription plans
│   ├── (auth)/             # Login / Signup screens
│   └── (tabs)/             # Tab navigation
│       ├── camera.tsx      # Main camera screen
│       ├── gallery.tsx     # User generations
│       └── profile.tsx     # Profile + settings
├── src/
│   ├── components/         # Reusable UI components
│   ├── lib/                # Supabase client, API, auth context
│   └── constants/          # Theme, transform definitions
├── supabase/
│   ├── migrations/         # Database schema
│   └── functions/          # Edge Functions (AI generation)
├── admin/                  # Web admin dashboard
└── assets/                 # App icons, splash screen
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- AI API key (Replicate, Fal.ai, or OpenAI)

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/Eastleigh/ai-glow-camera.git
   cd ai-glow-camera
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and API keys
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/001_init.sql`
   - Deploy edge function: `supabase functions deploy generate`
   - Set secrets in Supabase Dashboard (REPLICATE_API_TOKEN, etc.)

4. **Run the app**
   ```bash
   npx expo start
   ```
   - Scan QR code with Expo Go (iOS/Android)
   - Press `w` for web preview

### Admin Dashboard
Open `admin/index.html` in a browser. Configure Supabase credentials to connect to live data.

## AI Generation Flow

```
User takes photo
    → Uploads to Supabase Storage
    → Calls /generate Edge Function
    → Edge Function validates auth + credits
    → Deducts 1 credit
    → Calls AI provider (Replicate → Fal.ai → OpenAI fallback)
    → Stores result in Supabase Storage
    → Returns result URL to app
    → User sees transformed image
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | Backend API base URL |
| `EXPO_PUBLIC_SUPERWALL_IOS_KEY` | Superwall iOS public API key |
| `EXPO_PUBLIC_SUPERWALL_ANDROID_KEY` | Superwall Android public API key |
| `REPLICATE_API_TOKEN` | Replicate API token (Edge Function) |
| `FAL_KEY` | Fal.ai API key (Edge Function) |
| `OPENAI_API_KEY` | OpenAI API key (Edge Function) |

## MVP Success Metric

> A user can open the app, take a selfie with the native camera, generate an AI-enhanced version, and share it — in under 60 seconds.

## License

MIT
