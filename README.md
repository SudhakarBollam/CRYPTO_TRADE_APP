# Crypto Portfolio & Trade Intelligence Platform

Full-stack demo: **Node.js (Express) + MongoDB** REST API with **JWT authentication**, **role-based access control** (User, Admin, Analyst), trade journaling with **filtering and pagination**, **analyst analytics**, **CoinGecko** market data, **Swagger** docs, **rate limiting**, **structured logging**, and a **React (Vite)** client with **dark mode**, protected routes, and CRUD UX.

## Quick start (local)

1. **MongoDB** running on `mongodb://127.0.0.1:27017` (or set `MONGO_URI`).
2. **Backend** — from `backend/`:

   ```bash
   cp .env.example .env
   npm install
   npm run dev
   ```

   API: `http://localhost:5000` — Swagger UI: `http://localhost:5000/api-docs`.

3. **Frontend** — from `frontend/`:

   ```bash
   npm install
   npm run dev
   ```

   App: `http://localhost:5173` (Vite proxies `/api` to the backend).

4. **Bootstrap an admin** (optional):

   ```bash
   cd backend
   # Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then:
   npm run seed:admin
   ```

   Promote analysts or other roles from the **Admin** UI or `PATCH /api/v1/admin/users/:id/role`.

## Docker

From the repo root:

```bash
docker compose up --build
```

- API: `http://localhost:5000`
- Web (nginx + static build): `http://localhost:5173`
- Set `JWT_SECRET` in your environment when running compose in real deployments.

## API highlights

| Area | Notes |
|------|--------|
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| Trades | Full CRUD under `/api/v1/trades` with `asset`, `type`, `page`, `limit`, `userId` (staff) |
| Portfolio | `GET /api/v1/portfolio` — traders; optional `?userId=` for admins |
| Analytics | `GET /api/v1/analytics/summary`, `/by-asset` — **analyst** and **admin** only |
| Admin | `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/:id/role` |
| Market | `GET /api/v1/market/prices` — CoinGecko simple price proxy |

**Roles**

- **User**: create/update/delete **own** trades; portfolio.
- **Admin**: all trades/users; manage any trade; promote roles.
- **Analyst**: **read-only** on trades; analytics endpoints.

## API documentation

- **Swagger UI**: `/api-docs`
- **OpenAPI JSON**: `/api-docs.json`
- **Postman**: import `backend/docs/postman-collection.json` (set `baseUrl` + Bearer token).

## Load balancing & scalability (future scope)

- **Microservices**: Split concerns into independent deployable services (e.g. **Auth**, **Trades**, **Analytics**, **Market data**) behind an API gateway; each service owns its data and release cycle.
- **Load balancing**: Terminate TLS at **NGINX**, **HAProxy**, or a cloud LB; route to multiple Node instances. Combine with **Node `cluster` module** (`npm run cluster`) or multiple containers per service.
- **Caching**: Add **Redis** for session/token blocklists, hot read models (analytics summaries), and rate-limit counters shared across instances.
- **Horizontal scaling**: Run stateless API replicas behind a load balancer; use a replicated MongoDB tier (or Atlas); offload long aggregates to workers/queues as volume grows.

## Project structure

```
crypto-trade-app/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── server-cluster.js
│       ├── config/
│       │   ├── db.js
│       │   ├── index.js
│       │   └── swagger.js
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── scripts/
│       └── utils/
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        ├── assets/
        ├── components/
        ├── context/
        └── pages/
```

### What each folder contains

- `backend/`: Express API, MongoDB config, routes, controllers, services, Swagger docs, and admin seeding.
- `frontend/`: Vite-powered React client, protected routes, theme/toast context, and UI pages.
- `backend/docs/postman-collection.json`: Postman API collection for quick import.
- `docker-compose.yml`: Full-stack local compose setup for backend + frontend.

## License

ISC (backend `package.json`).
