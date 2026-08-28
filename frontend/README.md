# Kitchen Compass React frontend

This folder contains the chef-facing React/Vite web application. It is separate
from the Spring API and uses TanStack React Query for cached model reads and
request mutations. Vite proxies `/v1` and `/health` to Spring during local
development; the production Nginx image provides the same paths.

For local development, the root `run.cmd` starts the Vite development server on
`http://127.0.0.1:5173/` and the Spring API on `http://127.0.0.1:8080/`.

The application uses same-origin API requests by default. For a separately hosted
API, set `VITE_API_BASE_URL` at build time. The browser override remains available
for temporary diagnostics:

```html
<script>
  window.KITCHEN_COMPASS_API = "https://api.example.com";
</script>
```

Run `npm run check` to execute ESLint, Vitest, and a production build.
