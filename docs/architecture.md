# Architecture Overview

## Monorepo Layout

- `backend/` contains the shared REST API.
- `frontend/` contains four independent React applications plus a shared placeholder area.
- `database/` stores schema, seed, and migration assets.

## Backend Layers

- `routes/` register HTTP endpoints.
- `controllers/` handle request and response flow.
- `services/` provide application-level orchestration placeholders.
- `models/` represent persistence layer resource placeholders.
- `config/`, `middleware/`, and `utils/` support runtime setup and cross-cutting concerns.

## Frontend Apps

- `pos/` for cashier operations
- `customer/` for guest ordering and reservations
- `kitchen/` for kitchen workflow display
- `manager/` for dashboard and staff management

Each frontend uses the same folder pattern: `pages/`, `components/`, `services/`, `hooks/`, and `context/`.
