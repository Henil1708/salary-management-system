# ACME Salary Management System

Employee salary management software for an HR Manager to manage salary data for ~10,000 employees across multiple countries and answer org-wide compensation questions — replacing an Excel-based workflow.

## Status

**Planning stage.** No application code exists yet. This repository currently holds the requirements and architecture thinking that will drive implementation; see the tracking issue for the remaining setup work.

## Documentation

- [`PRD.md`](./PRD.md) — one-page product requirements document: goal, scope & features, and what's deliberately left out (with reasoning).
- [`docs/TRADEOFFS.md`](./docs/TRADEOFFS.md) — detailed architecture and trade-off notes: data model, seeding strategy, CSV import validation, auth/token architecture, monorepo & API contract, performance, deployment, and testing approach.
- [`CLAUDE.md`](./CLAUDE.md) — guidance for AI coding tools working in this repository, including the development workflow (which agents/skills to use at each stage of building a feature).

## Planned Architecture

Monorepo (npm/pnpm workspaces) with three packages:

- **`client/`** — React + TypeScript, shadcn/ui, Formik forms validated against shared Zod schemas.
- **`server/`** — Node.js + TypeScript, Express, Passport (local strategy for login, JWT strategy for access/refresh tokens).
- **`shared/`** — Zod schemas, derived TypeScript types, reference constants, and the API-response contract consumed by both `client/` and `server/`, so validation rules can't drift between them.

**Data**: PostgreSQL via Prisma, hosted on Supabase.
**Deployment**: frontend on Vercel, backend on Render or Railway.

Full reasoning behind these choices is in `docs/TRADEOFFS.md`.
