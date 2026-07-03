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
- **Salary Management**: each employee has a current salary (a **monthly** amount, currency, effective date) plus an immutable salary **history** — a revision creates a new record rather than overwriting the old one, with an effective date and reason.
- **Department Management**: HR can create, rename and delete departments (a delete is blocked while employees are still assigned); departments are a DB-backed reference, so a new one is immediately assignable to employees.
- **User Management**: HR can add more HR users (admin-provisioned accounts) and edit their own profile / change their own password.
- **Payroll runs** *(scope extension — see below)*: HR can generate a monthly payroll run that snapshots every active employee's current salary as a line item and tracks each as **Pending → Paid** (with a filtered "mark all paid"). This is **payment-status tracking only**, not disbursement/tax/bank rails — see the out-of-scope note.
- **Bulk Import / Export (CSV)** — surfaced *contextually within the salary/employee management screens*, not as a separate top-level feature. Since a CSV row is an employee record with their salary, Import ("upload salaries") and Export live as actions on the Salaries / Employee-directory pages the HR manager is already working in. Import bulk-creates/updates employees and salaries with per-row validation and a downloadable annotated error report for rejected rows; Export downloads the current filtered view. This is the direct digital replacement for "managing via Excel," placed where the data it touches lives.
- **Insights Dashboard**: headcount and average/median salary by country, department, and job level; total payroll cost normalized to one currency via a stored FX-rate table; highest/lowest pay bands; recent salary-change feed.
- **Seed data**: a script generating 10,000 realistic, deterministic employees with salary history across ~6–8 countries/currencies, departments, and job levels, for demo and grading.
- **Internationalization-ready UI**: all UI copy is routed through an i18n key/translation layer (resource files under `shared/`) from day one, even though v1 ships English-only — so adding a new language later is additive (a new resource file), not a retrofit of every component.

## Scope — Explicitly Out (v1) — and Why
| Excluded | Reasoning |
|---|---|
| Actual translated locales (non-English UI) | v1 ships English-only — no specific language requirement was given. The i18n *plumbing* is in place (see Scope-In) so adding a locale later is cheap; translating and QA'ing real content for a second language is deferred until one is actually requested. |
| Multi-role RBAC / approval workflows | Only one persona (HR Manager) is specified; roles/approvals add scope with no stated requirement. |
| Employee self-service portal / social login (SSO) | Spec calls for HR-only tooling with simple credential login; SSO adds IdP integration irrelevant to the goal. |
| Payroll **execution** (tax calc, disbursement, bank rails, payslips) | Still out. **Payroll *runs* were added as a scope extension** (a Payroll tab that snapshots a month's salaries and tracks Pending → Paid), but it is deliberately payment-*tracking* only — it records that a run happened and was marked paid, and performs no real money movement, tax, or bank integration. Real disbursement remains a materially different system. |
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
