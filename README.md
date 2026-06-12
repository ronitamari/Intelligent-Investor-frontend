# Intelligent Investor Frontend

Next.js dashboard for the Common Sense Spending strategy. It calculates four
monthly buckets through the NestJS API, saves profiles, reloads them across
sessions, and displays a 15-year Recharts projection at a fixed 7% return.

## Environment

Copy `.env.example` to `.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Development

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
npm run e2e
```

`npm run e2e` expects the frontend to be running at `http://localhost:3000`.
For the complete stack, use `docker compose up --build` in the parent project
directory.
