# AGENTS.md — Guidelines for Agentic Coding in this Repository

## Project Overview

Monorepo managed by **pnpm workspaces** with TypeScript throughout.

```
apps/
  backend/          # Node.js + Fastify + Mongoose (MongoDB)
  frontend/         # Placeholder — not yet configured
packages/
  shared/           # Zod schemas, domain types, utilities
```

## Commands

### Root-level

```
pnpm dev:backend          # Start backend with tsx watch
pnpm build:backend        # Compile backend to dist/
pnpm lint                 # Full lint: typecheck + biome check
pnpm typecheck            # pnpm -r typecheck
pnpm check                # Biome lint (read-only)
pnpm check:fix            # Biome lint with auto-fix
pnpm format               # Biome format --write
pnpm test                 # pnpm -r test (all packages)
pnpm test:watch           # pnpm -r test:watch
pnpm coverage             # pnpm -r coverage
```

### Single test (Vitest)

```
pnpm --filter @recipes/backend test -- -t "test name pattern"
pnpm --filter @recipes/backend test -- src/common/__tests__/errorHandler.test.ts
pnpm --filter @recipes/shared test -- -t "pagination"
```

## Code Style (TypeScript)

### TypeScript Strictness

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- `noUncheckedIndexedAccess`, `noImplicitOverride`, `erasableSyntaxOnly`
- `noExplicitAny` is an **error** — avoid `any`
- Target ES2024
