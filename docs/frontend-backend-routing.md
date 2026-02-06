
## Frontend → backend routing (thesisweb.com)

The frontend posts to:

- `POST /api/signup`

The backend service listens on localhost and exposes:

- `POST /v1/signup`

In production, nginx rewrites the public path to the backend:

- `/api/signup` → `http://127.0.0.1:8787/v1/signup`

This keeps the public URL stable while allowing the backend to version routes (`/v1/*`).

If you prefer to avoid rewrites, change the frontend to post directly to `/v1/signup`
and expose `/v1/*` publicly. The rewrite approach is usually cleaner for “marketing URL stability”.
