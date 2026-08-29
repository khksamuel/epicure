# Epicure React frontend

This folder contains the chef-facing React/Vite web application. It is separate
from the Spring API and uses TanStack React Query for cached model reads and
request mutations. Vite proxies `/v1` and `/health` to Spring during local
development; the production Nginx image provides the same paths.

For the default local workflow, use Docker from the repository root:

```bash
docker compose up --build
```

If Docker is not available, start the frontend manually:

```powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

The application uses same-origin API requests by default. For a separately hosted
API, set `VITE_API_BASE_URL` at build time. The browser override remains available
for temporary diagnostics:

```html
<script>
  window.EPICURE_API = "https://api.example.com";
</script>
```

Run `npm run check` to execute ESLint, Vitest, and a production build.

For a Docker-based frontend test pass, from the repository root:

```bash
docker compose --profile test run --rm test-frontend
```
