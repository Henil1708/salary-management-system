# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project State

This repository is currently **planning-stage only** — there is no application code, no `package.json`, and no monorepo scaffolding yet. It contains two planning documents and nothing else of substance:

- `PRD.md` — the one-page product requirements document (goal, scope, explicit out-of-scope list with reasoning).
- `docs/TRADEOFFS.md` — the detailed architecture and trade-off reasoning behind every non-obvious decision (data model, seeding strategy, CSV import validation, auth/token architecture, monorepo & API contract, performance, deployment, testing).

**Read both files before writing any code.** They contain firm decisions already made (not open questions) — do not re-derive or second-guess them without a good reason; extend from them.

Once the codebase exists, this section and the "Commands" section below should be rewritten to reflect the actual build/lint/test setup.

## What's Being Built

Employee salary management software for an HR Manager to manage salary data for ~10,000 employees across multiple countries and answer org-wide compensation questions — replacing an Excel-based workflow. Full feature list and rationale live in `PRD.md`.

## Planned Architecture (per `docs/TRADEOFFS.md`)

**Monorepo** (npm/pnpm workspaces): `client/`, `server/`, `shared/`. `shared/` holds Zod schemas, derived TypeScript types, reference constants (countries/currencies/job levels/departments), the `ApiResponse<T>` envelope type, and i18n translation resource files (`shared/locales/`) — the single source of truth consumed by both apps so validation rules and copy can't drift between frontend and backend.

**Stack**: React + TypeScript + shadcn/ui + Formik (client) · Node.js + TypeScript + Express + Passport (server) · PostgreSQL via Prisma, hosted on Supabase · deployed to Vercel (client) / Render or Railway (server).

Key decisions to preserve when implementing (details/reasoning in `docs/TRADEOFFS.md`):

- **Salary is an append-only ledger, not a mutable column.** Every salary change is a new `SalaryRecord` row (amount, currency, effectiveDate, reason); `isCurrent` is a denormalized flag maintained on write. Never overwrite a salary in place.
- **Money uses `decimal`/Prisma `Decimal`, never `float`.**
- **Auth is stateless JWTs, no server-side token table.** Access token (~15 min) and refresh token (~7–30 days) both carry `{ userId, tokenVersion, type }`, signed with different secrets, stored client-side in `localStorage`, sent as `Authorization: Bearer`. Verified via `passport-jwt` strategies. `User.tokenVersion` is the revocation mechanism — incrementing it (on password reset or logout-everywhere) invalidates all previously issued refresh tokens without needing a token table.
- **Password reset** uses a separate, single-use, hashed, time-boxed (30 min) token in a `PasswordResetToken` table — distinct from the access/refresh JWTs. Full life cycle is documented step-by-step in `docs/TRADEOFFS.md` §4.
- **CSV bulk import** validates every row independently (Zod) before touching the DB, and commits all valid rows even if some rows are rejected — never all-or-nothing. Rejected rows come back as a downloadable, annotated CSV. `.xlsx` parsing is explicitly out of scope; CSV only.
- **API responses** follow a JSend-style three-state envelope: `{ status: "success", data }` / `{ status: "fail", data: <field→message map> }` / `{ status: "error", message, code }`. The `fail` shape matches Zod's error map so it can feed directly into Formik field errors.
- **Dashboard aggregates are computed in SQL** (`GROUP BY`/`AVG`/`COUNT`), not pulled into the app layer — the employee list is always server-side paginated/filtered/sorted, never fetched in full to the client.
- **Seed script** generates 10,000 employees deterministically (fixed faker seed) with realistic per-country/per-level salary bands (not flat random) and salary history, inserted in batches.
- **UI strings are i18n-keyed from day one**, not hardcoded — every client string goes through a translation function (`t('key')`) against a resource file in `shared/locales/` (only `en.json` populated in v1). This keeps future multi-language support additive rather than a component-by-component retrofit; see `docs/TRADEOFFS.md` §5.

## External Services

- A Supabase project is already provisioned (see `.mcp.json` for the MCP server reference) — use it for Postgres hosting rather than provisioning a new database.

## Development Workflow

The assessment this project is built for explicitly grades *how* it was built (incremental commits, use of AI tooling, engineering judgment), not just the end result. Use this rhythm for every feature in `PRD.md`'s scope, rather than writing code ad hoc:

1. **Blueprint** — before touching code, use the `feature-dev:code-architect` agent (or the `feature-dev` skill) to turn the relevant section of `docs/TRADEOFFS.md` into a concrete file-by-file plan. Use `feature-dev:code-explorer` first if extending something that already exists, so the new code matches established patterns (e.g. how a Zod schema in `shared/` is consumed on both sides).
2. **Implement** — write the code directly.
3. **Exercise** — run the `/verify` skill (or `/run` to launch and screenshot the app) to confirm the feature actually works end-to-end, not just that it typechecks.
4. **Review** — run the `feature-dev:code-reviewer` agent and/or the `/code-review` skill on the diff before committing.
5. **Cleanup** — run the `code-simplifier:code-simplifier` agent and/or the `/simplify` skill for a quality-only pass (reuse, clarity, efficiency).
6. **Commit** — use the `/commit` skill (or `/commit-push-pr` if opening a PR) to make a small, incremental commit. Prefer many small commits over one large dump — the commit history is a deliverable.

Situational agents/skills — reach for these when the trigger applies, not on every feature:

- **`/frontend-design` skill** — before building any shadcn-based screen (employee directory, dashboard). The brief calls for the UI to look "very professional," not default-templated shadcn.
- **`/dataviz` skill** — before writing any chart in the Insights Dashboard (salary-by-department/country/level, payroll cost breakdown, pay bands).
- **`/security-review` skill** — one dedicated pass over the auth/token implementation (login, JWT issuance/verification, forgot/reset password) once it's built.
- **`Plan` agent** — for scoping a larger chunk of work up front (e.g. "plan the CSV import pipeline end-to-end") when a full architect blueprint is overkill but ad hoc isn't enough.
- **`Explore` agent** — fast targeted lookups once the codebase has grown, instead of manually grepping.
- **`general-purpose` agent** — open-ended multi-step tasks that don't fit a more specific agent (e.g. scaffolding the whole monorepo skeleton in one pass).
- **`playwright-issue-analyzer` → `playwright-fix-planner` → `playwright-fix-executor`** — if/when Playwright E2E tests are added (e.g. covering login, CSV import, dashboard), use this three-agent pipeline to diagnose and fix failures rather than debugging blind.
- **`branch-creator` agent** — only if adopting a per-feature branch+PR workflow; a disciplined incremental-commit history on `main` also satisfies the assessment.
- **`/fewer-permission-prompts` skill** — run early in the build (this will be a long multi-session project) to allowlist repeated Bash/MCP calls and cut down on prompt friction.
- **`/update-config` skill** — situational, e.g. to wire up a pre-commit hook that runs lint/tests automatically.
- **`claude-code-setup:claude-automation-recommender` skill** — optional one-time pass once real code exists, to check for project-specific hooks/subagents worth adding beyond this list.

## Commands

No build, lint, or test commands exist yet — there is no code to run them against. Once the monorepo is scaffolded, update this section with the actual commands (e.g. `npm run dev`, `npm run build`, `npm test`, `npm run seed`, per-workspace equivalents).
