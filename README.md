# Overlift

A lean-bulk workout tracker built with Next.js 15, Tailwind v4, shadcn/ui, and Supabase.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **shadcn/ui**
- **Supabase** (Postgres + Auth)
- **Recharts** (weight chart)
- **Vercel** (deployment)

---

## 1. Local setup

```bash
# Clone / download the project, then:
npm install
```

---

## 2. Supabase setup

1. Go to [supabase.com](https://supabase.com) → New project
2. In **SQL Editor**, run the contents of `supabase/schema.sql` (the full schema + seed data + RLS policies)
3. Copy your project credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` — from **Project Settings → API → Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from **Project Settings → API → anon public**
4. Configure Auth for magic links:
   - **Authentication → Providers → Email**: enable Email provider and magic links
   - **Authentication → URL Configuration**:
     - Site URL: `http://localhost:3000` (for local dev)
     - Redirect URL: `http://localhost:3000/auth/callback`

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).

Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in **Vercel → Project → Settings → Environment Variables**.
Also add your production callback URL in Supabase Auth URL Configuration:
- `https://your-domain.com/auth/callback`

---

## Project structure

```
overlift/
├── app/
│   ├── layout.tsx          # Root layout (font, theme)
│   ├── page.tsx            # Redirects → /workout
│   ├── workout/page.tsx    # Workout tab
│   ├── progress/page.tsx   # Bodyweight progress tab
│   ├── nutrition/page.tsx  # Nutrition targets tab
│   └── timer/page.tsx      # Rest timer tab
├── components/
│   ├── nav.tsx             # Bottom / top navigation
│   ├── day-tabs.tsx        # Mon–Sun day selector
│   ├── exercise-list.tsx   # Exercise checklist + set logger
│   ├── weight-chart.tsx    # Recharts weight line chart
│   ├── macro-bars.tsx      # Macro breakdown bars
│   ├── rest-timer.tsx      # Circular rest timer
│   └── ui/                 # shadcn primitives
├── lib/
│   ├── supabase.ts         # Supabase browser client
│   ├── program.ts          # Static workout program data
│   └── nutrition.ts        # BMR / macro calc helpers
├── types/
│   └── db.ts               # TypeScript types for DB tables
└── supabase/
    └── schema.sql          # Full schema + seed (run this in Supabase)
```

---

## Database schema

Five tables:

| Table | Purpose |
|---|---|
| `exercises` | Master exercise list (seeded) |
| `workout_sessions` | One row per gym visit |
| `set_logs` | Every set logged, FK → sessions + exercises |
| `weight_logs` | Weekly bodyweight check-ins |
| `nutrition_logs` | Daily macro tracking |

See `supabase/schema.sql` for the full schema, indexes, and seed data.
