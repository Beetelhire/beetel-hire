# Beetel Hire — Next.js + Supabase

The production app for **beetelhire.in**. Mirrors the prototype's design pixel-for-pixel and uses
Supabase for the database, auth, and CV storage.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (Postgres + Auth + Storage)
- **Calendly** (booking)
- **Vercel** (hosting)

## What's built so far (Chunk 1 — foundation)

- Project scaffold (`package.json`, TS config, `.gitignore`, env example)
- Global CSS imported from the prototype (`app/globals.css` — 4480 lines, identical visuals)
- Root layout with theme provider, nav, footer, mobile menu, book-call modal, toast
- Home page (live data from Supabase `jobs` where `status = 'live'`)
- Topology animation component
- Supabase client + server helpers
- TypeScript types matching the database schema
- `POST /api/book-call` — saves a lead to Supabase `meetings` then opens Calendly

## What's next

- Chunk 2: about, industries, jobs list (with all filters), job detail page, apply form with CV upload
- Chunk 3: sign-in, admin layout + overview + jobs CRUD + candidate pool + drawer
- Chunk 4: analytics, team, meetings, settings (social integrations)

---

## Running locally

You'll need **Node.js 18+** installed. To check: open a terminal and run `node -v`. If you don't have it, install from [nodejs.org](https://nodejs.org).

```bash
# 1. Get into the project folder
cd beetel-hire

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Then open .env.local in any text editor and fill in:
#   - NEXT_PUBLIC_SUPABASE_URL       (from Supabase Settings → Data API)
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY  (from Supabase Settings → API)
#   - SUPABASE_SERVICE_ROLE_KEY      (same place — keep private)
#   - NEXT_PUBLIC_CALENDLY_URL       (your Calendly event URL)
#   - NEXT_PUBLIC_SITE_URL           (https://beetelhire.in)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the home page with whatever live jobs you've inserted into the `jobs` table.

---

## Deploying to Vercel (will detail in Chunk 5)

```bash
# Create a private GitHub repo, then:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-handle>/beetel-hire.git
git push -u origin main
```

In Vercel → New Project → import the repo → add the env vars from `.env.local.example`
→ Deploy. Then add `beetelhire.in` under the project's Domains and update GoDaddy DNS:

```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

---

## File map (current)

```
beetel-hire/
├── app/
│   ├── layout.tsx              ← root layout
│   ├── page.tsx                ← home page (reads live jobs from Supabase)
│   ├── globals.css             ← full prototype CSS (4480 lines)
│   └── api/
│       └── book-call/route.ts  ← saves lead + opens Calendly
├── components/
│   ├── providers.tsx           ← theme provider
│   ├── nav.tsx                 ← top floating nav
│   ├── footer.tsx              ← shared footer
│   ├── mobile-menu.tsx         ← hamburger drawer
│   ├── topology-canvas.tsx     ← animated network background
│   ├── bg-orbs.tsx             ← ambient gradient orbs
│   ├── toast.tsx               ← global toast notifications
│   ├── book-call-modal.tsx     ← lead-capture before Calendly
│   ├── home-ctas.tsx           ← client-side CTAs on the home page
│   ├── hero-eyebrow.tsx        ← hero pill
│   └── job-row.tsx             ← reusable job row component
├── lib/
│   ├── supabase-client.ts      ← browser Supabase client
│   ├── supabase-server.ts      ← server clients (cookie-based + admin)
│   ├── auth.ts                 ← isAdmin / getCurrentProfile helpers
│   └── format.ts               ← currency, fmtRelative, etc.
├── types/
│   └── database.ts             ← TypeScript types for all tables
├── public/
│   ├── beetel-hire-logo-light.svg
│   └── beetel-hire-logo-dark.svg
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```
