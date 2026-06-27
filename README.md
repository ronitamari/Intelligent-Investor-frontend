# Intelligent Investor Frontend

Next.js dashboard for the Common Sense Spending strategy. It calculates four
monthly buckets through the NestJS API, saves profiles, reloads them across
sessions, and displays a 15-year Recharts projection at a fixed 7% return.

## Environment

Copy `.env.example` to `.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL used by the browser | `http://localhost:4000` |

The frontend CI/CD workflow also requires these GitHub repository secrets:

| Secret | Purpose |
| --- | --- |
| `QUAY_USERNAME` | Quay registry username |
| `QUAY_PASSWORD` | Quay registry password/token |
| `OPENSHIFT_TOKEN` | OpenShift login token |
| `OPENSHIFT_SERVER` | OpenShift API server URL |
| `OPENSHIFT_NAMESPACE` | Target OpenShift namespace/project |
| `NEXT_PUBLIC_API_URL_PREP` | Prep/stage backend API URL baked into the prep frontend image |
| `NEXT_PUBLIC_API_URL_PROD` | Production backend API URL baked into the prod frontend image |

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
For the complete local development/testing stack, use
`.\scripts\dev.ps1` or `bash scripts/dev.sh` in the parent project directory.
Prep/stage and production use the Kubernetes/OpenShift manifests in `k8s/`
through CI/CD, not Docker Compose.
