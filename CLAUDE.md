# CLAUDE.md — kra-web-frontend-nuxt

## Interaction Rules

- **Language:** All code, comments, variable names, and documentation files must be written in English.
- **Git Strategy:** Trunk Based Development. Each GSD phase executes on a dedicated branch `feat/phase-NN-<slug>` branched from `main`. Never commit directly to `main`.
- **Commits:** Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- **Atomic:** Split commits at the component or page level — one new component/page = one commit. Do not bundle multiple concerns into a single commit.

## Frontend-Specific Rules

- **Runtime:** Nuxt 4 with `app/` layout convention — all pages, components, and composables live under `app/`, not the repo root.
- **Package manager:** Yarn (not npm or pnpm). Always use `yarn` commands.
- **State management:** Pinia stores for global shared state; `useAsyncData`/`useFetch` for SSR data fetching.
- **Forms:** VeeValidate + Zod schemas for all form validation.
- **Tests:** Vitest for unit and component tests. `yarn test` (or equivalent vitest command) must pass before any commit.
- **Admin routes:** `/admin/**` are SPA-only (`ssr: false` in `nuxt.config.ts` routeRules); protected by auth middleware that checks the `kra_session` httpOnly cookie.
- **Auth:** Cognito OAuth2 code flow handled in Nuxt server routes (`server/api/auth/`). Only `cognitoClientSecret` is private runtimeConfig; `cognitoClientId` and `cognitoRedirectUri` are public runtimeConfig.
- **No backend calls from browser for admin writes:** Use same-origin Nuxt server routes (`/api/admin/posts`) that forward `Authorization: Bearer` from `kra_session` cookie to the Spring Boot API.

## Repository Context

Nuxt 4 / Vue 3 portfolio frontend (SSR public pages + SPA admin):
- **Public pages (SSR):** `/` (hero + portfolio), `/blog` (post list), `/blog/[slug]` (Markdown rendered with marked + DOMPurify), `/portfolio/[owner]/[repo]` (GitHub detail), `/contact`, `/cv`
- **Admin SPA (`/admin`):** Blog post CRUD dashboard (Pinia `useBlogStore`), Markdown split-pane editor, quality metrics widget (SonarCloud badges)
- **Auth flow:** Cognito Hosted UI → `/api/auth/callback` (code exchange → id_token in httpOnly cookie) → `/api/auth/logout` (federated logout)

See [kra-docs-architecture](https://github.com/krealalejo/kra-docs-architecture) for the full system C4 diagrams.

## Current Phase: 21 — C4 Final & Launch

All features complete. This phase adds README badges and this CLAUDE.md only. No component or page changes.
