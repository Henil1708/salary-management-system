# Repository Structure

Companion to `PRD.md` and `docs/TRADEOFFS.md`. This documents the monorepo's folder layout — what exists, what each directory is for, and where upcoming pieces land (per the file-by-file blueprint in GitHub issue #2). Update this file when the structure changes.

## Top level

```
salary-management-system/
├── package.json           # yarn workspaces root (shared, server; client to be added)
├── tsconfig.base.json     # strict compiler options every workspace extends
├── .nvmrc                 # Node 22 (required by Prisma 7's CLI)
├── PRD.md                 # product requirements — scope and out-of-scope reasoning
├── docs/
│   ├── TRADEOFFS.md       # architecture decisions and their reasoning
│   └── STRUCTURE.md       # this file
├── shared/                # @salary/shared — single source of truth for both apps
├── server/                # @salary/server — Express API
└── client/                # (not yet created) React + shadcn/ui app
```

The root `package.json` delegates via `yarn workspace @salary/<name> <script>`; `shared` always builds before `server` because the server imports its compiled output.

## `shared/` — `@salary/shared`

Everything both apps must agree on, so validation rules, reference lists and response shapes can't drift between frontend and backend (TRADEOFFS §5).

```
shared/
├── package.json           # deps: zod only; scripts: build, dev (watch), test
├── tsconfig.json
└── src/
    ├── index.ts           # barrel — everything is consumed via @salary/shared
    ├── constants/
    │   ├── countries.ts          # 8 countries + derived COUNTRY_CODES / CURRENCY_CODES
    │   ├── departments.ts        # 8 departments
    │   ├── job-levels.ts         # 5 job levels + employee statuses
    │   └── validation-limits.ts  # VALIDATION_LIMITS — every numeric rule limit, once
    ├── types/
    │   └── api-response.ts       # ApiResponse<T> JSend envelope + Paginated<T>
    ├── schemas/                  # Zod — imported by server middleware AND client forms
    │   ├── auth.schema.ts        # login / forgot-password / reset-password
    │   ├── employee.schema.ts    # create / update / list-query contract
    │   ├── salary-record.schema.ts
    │   └── csv-import.schema.ts  # string-first per-row schema for bulk import
    ├── locales/
    │   └── en.json               # all UI copy + errors.validation.* / errors.codes.* keys
    └── __tests__/
        └── locale-keys.test.ts   # guard: every schema message is a key in en.json
```

Conventions:
- Schema validation messages are **locale keys** (`errors.validation.…`), never English sentences — the client translates them (TRADEOFFS §5).
- Reference lists are `as const` arrays; Zod enums, client dropdowns and the seed script all derive from them. No Prisma enums duplicating these lists.

## `server/` — `@salary/server`

```
server/
├── package.json
├── tsconfig.json          # path aliases: @config/* @controllers/* @middleware/*
│                          #   @routes/* @services/* @utils/*  → src/...
├── prisma.config.ts       # Prisma 7 CLI config — migrations use DIRECT_URL
├── prisma/
│   ├── schema.prisma      # full data model (TRADEOFFS §1); no datasource URL here
│   ├── migrations/
│   └── seed.ts            # (upcoming) deterministic 10k-employee seed
├── .env / .env.example    # env vars validated at boot by src/config/env.ts
└── src/
    ├── server.ts          # entry: env → DB connect → listen → graceful shutdown
    ├── app.ts             # middleware order: helmet → cors → json → passport →
    │                      #   /api/v1 routes → notFoundHandler → errorHandler
    ├── config/
    │   ├── env.ts         # Zod-validated process.env, fail-fast
    │   ├── database.ts    # Prisma client singleton (pg driver adapter, pooled URL)
    │   └── passport.ts    # 3 strategies: local, jwt-access (no DB), jwt-refresh (DB check)
    ├── middleware/
    │   ├── auth.ts        # requireAuth / requireRefreshToken (envelope-consistent 401s)
    │   ├── validate.ts    # validateRequest({body,query,params}) w/ shared schemas
    │   ├── errorHandler.ts# the ONLY producer of fail/error envelopes + 404 handler
    │   └── rateLimiter.ts # login + forgot-password limiters
    ├── routes/            # one router per feature, mounted in routes/index.ts
    ├── controllers/       # (upcoming) thin handlers: call service → sendSuccess
    ├── services/          # (upcoming) business logic, no req/res
    ├── utils/
    │   ├── errors.ts      # AppError hierarchy; code doubles as errors.codes.* key
    │   ├── jwt.ts         # sign access/refresh (separate secrets) + reset-token hash
    │   ├── password.ts    # bcrypt cost 12
    │   ├── api-response.ts# sendSuccess — controllers never hand-roll the envelope
    │   └── logger.ts      # Winston
    ├── types/
    │   └── express.d.ts   # req.user shape set by the passport strategies
    └── generated/         # Prisma client output — gitignored, run prisma:generate
```

Layering rule: **routes → controllers → services → prisma**. Controllers stay thin (call a service, `sendSuccess`); services hold business logic and never touch `req`/`res`; the error middleware is the only place `fail`/`error` envelopes are built.

## `client/` — `@salary/client`

React + Vite + **classic Redux** (actionTypes/actions/reducers/selectors — NOT Redux Toolkit slices), feature-based architecture. Full blueprint with per-file responsibilities and the 13 architecture rules: **GitHub issue #14**.

```
client/
├── vite.config.ts         # @/ alias; @salary/shared aliased to ../shared/src (compiled from source)
├── components.json        # shadcn/ui → src/shared/components/ui
├── tailwind.config.ts / postcss.config.js
└── src/
    ├── main.tsx           # <Providers><AppRouter/></Providers>
    ├── app/
    │   ├── store/         # store.ts (legacy_createStore + thunk), rootReducer, types (RootState/AppDispatch/AppThunk + typed hooks)
    │   ├── router/        # createBrowserRouter; private-routes (auth guard, 'restoring' spinner), public-routes (login bounce)
    │   ├── layouts/       # dashboard-layout (sidebar/header/user), auth-layout (centered card)
    │   └── providers/     # redux → theme → i18n (i18next initialized from @salary/shared enLocale)
    ├── features/          # one folder per domain: auth, employees, salary, dashboard, import-export
    │   └── <feature>/     # actions/ (actionTypes + thunks), reducers/, selectors/, services/,
    │                      #   pages/, components/, hooks/, index.ts (public surface)
    ├── shared/
    │   ├── components/ui/ # shadcn-generated primitives (eslint-ignored)
    │   ├── services/      # api-client (JSend unwrapping, ApiFieldError/ApiCodeError, silent single-flight refresh), token-storage (localStorage)
    │   ├── utils/         # cn, errors (tError w/ VALIDATION_LIMITS interpolation, codeToMessage)
    │   └── config/env.ts  # typed VITE_* access, fail-fast
    ├── assets/  styles/globals.css
```

Client rules (blueprint #14): components dispatch thunks, never call services; every state read goes through selectors; Redux stores locale keys/codes for errors, never English; API types and schemas come from `@salary/shared`, never redeclared; every string through `t()`.
