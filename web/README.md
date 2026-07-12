# EliteTeam Web

Next.js App Router backend + dashboard for EliteTeam SaaS.

## Zero-config dev (in-memory)

No database required. Demo account pre-seeded:

- Email: `demo@eliteteam.app`
- Password: `demo1234`

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with the demo account.

## Enable Postgres

Set `DATABASE_URL` to a Postgres connection string (Neon, Supabase, etc.):

```bash
cp .env.example .env
# add DATABASE_URL=... and AUTH_SECRET=...
npm run drizzle:push
```

The app auto-selects the Postgres repo when `DATABASE_URL` is set.

## Vercel free deployment

1. Import the repo into Vercel.
2. Set **Root Directory** to `web`.
3. Add env var `AUTH_SECRET` (random string, 32+ chars).
4. Optional: add `DATABASE_URL` for Neon/Supabase free Postgres.
5. Deploy.

The marketing site (`index.html`, etc.) can be deployed from the repo root as a separate Vercel project or as static assets.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm run typecheck` — TypeScript check
- `npm run drizzle:push` — push schema to Postgres (requires drizzle-kit)
