# Prabal Kalia Portfolio

Semi-professional personal site for **Prabal Kalia**, with a **Starkizard** Neon Void hangar (sprites + interests) and a session-only **Casino** (blackjack + European roulette).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` — professional portfolio (Blueprint Atelier)
- `/starkizard` — hangar / interests + sprite stage
- `/starkizard/casino` — buy-in lobby + session HUD
- `/starkizard/casino/blackjack` — 6-deck S17 blackjack + helpers
- `/starkizard/casino/roulette` — European roulette

Legacy redirects:

- `/starkizard/blackjack` → `/starkizard/casino/blackjack`
- `/starkizard/games` → `/starkizard`

## Content

Profile copy lives in `src/data/profile.ts` (sourced from resume + public profiles).
