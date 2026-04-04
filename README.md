# Restaurant POS Monorepo

Production-oriented monorepo scaffold for a restaurant POS ecosystem with a shared Node.js/Express backend, PostgreSQL database layer, and four independent React frontends for customer, cashier, kitchen, and manager workflows.

## Tech Stack

- Backend: Node.js, Express, pg
- Database: PostgreSQL (Neon-compatible)
- Frontend: React, Vite, Tailwind CSS, React Router
- Architecture: Clean architecture inspired structure with routes, controllers, services, and models

## Project Structure

- `backend/` shared API server
- `frontend/pos/` cashier POS interface
- `frontend/customer/` QR ordering and reservation interface
- `frontend/kitchen/` kitchen display interface
- `frontend/manager/` dashboard and staff interface
- `frontend/shared/` shared UI and utility placeholders
- `database/` SQL schema, seed, and migrations placeholders
- `docs/` architecture and API documentation

## Setup

1. Copy `.env.example` to `.env` and update environment variables.
2. Install backend dependencies with `npm install --prefix backend`.
3. Install frontend dependencies for each app:
   - `npm install --prefix frontend/pos`
   - `npm install --prefix frontend/customer`
   - `npm install --prefix frontend/kitchen`
   - `npm install --prefix frontend/manager`
4. Start the backend with `npm run dev:backend`.
5. Start any frontend independently, for example `npm run dev:pos`.

## Notes

- This repository contains scaffold code only.
- Business logic, domain rules, and production integrations are intentionally not implemented yet.
