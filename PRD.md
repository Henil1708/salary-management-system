# Product Requirements Document — ACME Salary Management System

## Goal
Replace ACME's Excel-based salary administration with a single web application that lets an **HR Manager** manage salary data for the org's ~10,000 employees across multiple countries, and answer compensation questions (headcount, pay by department/country/level, total payroll cost) without manual spreadsheet work.

## User Persona
**HR Manager** — the only user role in v1. Data-literate, comfortable with Excel; needs the system to be at least as fast as Excel for day-to-day lookups and far better for reporting and history.

## Problem Statement
Salary data for 10,000 employees across multiple countries currently lives in spreadsheets: hard to search, no reliable change history, error-prone to update, no single source of truth, and impossible to answer org-wide questions ("what's our average salary per department in Germany?") without manual pivoting.

## Scope — In (v1)
- **Auth**: email/username + password login. No self-registration — HR accounts are seeded/admin-created. Full **forgot-password → emailed reset link → time-boxed single-use token → set new password** flow.
- **Employee Directory**: paginated, searchable (name / email / employee ID), filterable (department, country, job level, status) list of all employees; view and edit an employee's profile.
- **Salary Management**: each employee has a current salary (amount, currency, effective date) plus an immutable salary **history** — a revision creates a new record rather than overwriting the old one, with an effective date and reason.
- **Bulk Import (CSV)**: HR can upload a CSV to bulk create/update employees and salaries, with per-row validation and a downloadable error report for any rejected rows — the direct digital replacement for "managing via Excel."
- **Insights Dashboard**: headcount and average/median salary by country, department, and job level; total payroll cost normalized to one currency via a stored FX-rate table; highest/lowest pay bands; recent salary-change feed.
- **Export**: CSV export of the current (filtered) employee/salary view.
- **Seed data**: a script generating 10,000 realistic, deterministic employees with salary history across ~6–8 countries/currencies, departments, and job levels, for demo and grading.
- **Internationalization-ready UI**: all UI copy is routed through an i18n key/translation layer (resource files under `shared/`) from day one, even though v1 ships English-only — so adding a new language later is additive (a new resource file), not a retrofit of every component.

## Scope — Explicitly Out (v1) — and Why
| Excluded | Reasoning |
|---|---|
| Actual translated locales (non-English UI) | v1 ships English-only — no specific language requirement was given. The i18n *plumbing* is in place (see Scope-In) so adding a locale later is cheap; translating and QA'ing real content for a second language is deferred until one is actually requested. |
| Multi-role RBAC / approval workflows | Only one persona (HR Manager) is specified; roles/approvals add scope with no stated requirement. |
| Employee self-service portal / social login (SSO) | Spec calls for HR-only tooling with simple credential login; SSO adds IdP integration irrelevant to the goal. |
| Payroll execution (tax calc, disbursement, bank rails) | This is a salary *record-keeping & reporting* tool, not a payroll processor — a materially different system. |
| Live FX-rate API | Currency normalization uses a static, seeded rates table. Avoids an external dependency/failure mode in a demo system; revisit only if real-time FX accuracy becomes a real requirement. |
| Full `.xlsx` parsing (multi-sheet, formulas, merged cells) | Import supports CSV only. `.xlsx` edge cases are a large surface area for little payoff — CSV is exactly what an "export from Excel" workflow already produces. |
| Production transactional email | Password-reset emails go through a dev/stub provider (e.g. Ethereal, or logged), not a paid ESP — this is a demo deployment, not a production mail sender. |
| Real-time collaboration / notifications | Single HR Manager persona; no concurrent-editing or live-sync requirement. |
| Dedicated audit-log UI | Every write is timestamped with an actor at the DB level; a full audit-trail screen is deferred. |

## Success Criteria
- HR Manager can find any of 10,000 employees and see current + historical salary in under 2 seconds.
- HR Manager can answer "average salary by department in country X" from the dashboard alone, with no export to Excel needed.
- A CSV import with some invalid rows still commits all valid rows and clearly reports which rows failed and why.
- Forgot/reset password works end-to-end without any manual/support intervention.

## Tech Stack
Monorepo with a shared `shared/` layer (Zod schemas, types, API-response contract) consumed by both apps, so validation rules and shapes can't drift between them:
- **Client** (`client/`): React + TypeScript, shadcn/ui, Formik forms validated against shared Zod schemas.
- **Server** (`server/`): Node.js + TypeScript, Express, Passport (local strategy for login, JWT strategy for access/refresh tokens).
- **Data**: PostgreSQL via Prisma, hosted on Supabase.
- **Deployed**: frontend on Vercel, backend on Render/Railway.

*See `docs/TRADEOFFS.md` for the data model, validation rules, seeding strategy, auth/token architecture, monorepo & API contract, performance considerations, and deployment/testing approach.*
