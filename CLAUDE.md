# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install
pnpm dev              # localhost:3000
pnpm build
pnpm generate         # SSG
pnpm typecheck
pnpm test             # Vitest run (also runs on pre-push via lefthook)
pnpm test:watch       # watch mode
pnpm test:coverage    # coverage report (80% threshold: lines/statements/functions/branches)
```

To run a single test file: `pnpm vitest run app/composables/useMarkdown.test.ts`

## Architecture

### API routing: Nitro proxy vs direct

In **production** all frontend → backend calls go through Nitro proxy rules (`/api/*` → `kra-api`). The browser never sees the backend URL. In **development** `runtimeConfig.public.apiBase` resolves to `http://localhost:8080` directly (bypassing the proxy). This is controlled in `nuxt.config.ts`:

```ts
public: {
  apiBase: process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:8080";
}
```

Cached proxy routes: `/api/portfolio/**` (5 min), `/api/config/**` (5 min), `/api/images/**` (7 days), `/api/activity` (1 min).

### Auth flow (Cognito OAuth2 code flow)

The Cognito client secret **never leaves the server**. Full flow:

1. `/admin/login` redirects browser to Cognito Hosted UI
2. Cognito redirects back to `/api/auth/callback` (Nitro server route)
3. `server/api/auth/callback.get.ts` exchanges the code for tokens using `config.cognitoClientSecret` (private runtimeConfig)
4. Sets two cookies: `kra_session` (httpOnly, contains `access_token`, 1h) and `kra_user` (readable by JS, contains email)
5. Redirects to `/admin/quality`

`server/api/auth/session.get.ts` checks `kra_session` cookie and decodes the JWT expiry client-side to return `{ authenticated: true/false }`.

`app/middleware/auth.ts` calls `/api/auth/session` on every `/admin/**` navigation (except `/admin/login` and `/admin/callback`).

### SSR vs SPA split

`routeRules` in `nuxt.config.ts`:

- `/admin/**` → `ssr: false` (client-side SPA, auth happens client-side after hydration)
- `/admin/login` → `ssr: true` (override — login page is server-rendered)
- All public pages default to SSR

### Admin server routes

`server/api/admin/**` are **authenticated Nitro routes** that proxy to `kra-api` with the `kra_session` cookie forwarded as a `Bearer` token. They handle: posts CRUD, projects CRUD, CV (experience/education/skills), activity cards, profile config, image upload/delete, cache management, metrics.

### Pinia stores

- `blog.ts` — blog post CRUD (used by admin pages); calls `/api/admin/posts`
- `activity.ts` — activity cards (used by admin `/admin/activity`)

Public pages use `useAsyncData`/`useFetch` composables directly (no store).

### Key composables

| Composable             | Purpose                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| `useMarkdown.ts`       | Renders markdown via `marked` + sanitizes with `DOMPurify`/`sanitize-html` |
| `useMermaid.ts`        | Lazy-loads and renders Mermaid diagrams in blog posts                      |
| `useGsapAnimations.ts` | Reusable GSAP animation presets for page/component transitions             |
| `useS3.ts`             | Polls `/api/admin/image-status` after upload to wait for S3 thumbnail      |
| `useTheme.ts`          | Light/dark theme toggle persisted to localStorage                          |
| `useBlogPostForm.ts`   | VeeValidate + Zod form logic for blog post creation/edit                   |
| `useApiError.ts`       | Normalises API error responses for display                                 |

### Test setup

Tests use `@nuxt/test-utils` with `environment: 'nuxt'` and `happy-dom`. The vitest config overrides `runtimeConfig` with test values so composables that call `useRuntimeConfig()` work without a real env. Setup file: `app/tests/setup.ts`. Coverage includes `app/**/*.ts`, `app/**/*.vue`, `server/**/*.ts`.

## Required env vars (`.env`)

| Variable                     | Notes                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_API_BASE_URL`   | `kra-api` base URL (used by both proxy rules and dev direct calls)                |
| `NUXT_COGNITO_CLIENT_ID`     | Cognito App Client ID                                                             |
| `NUXT_COGNITO_CLIENT_SECRET` | Cognito App Client Secret — **server-only** (`runtimeConfig.cognitoClientSecret`) |
| `NUXT_PUBLIC_COGNITO_DOMAIN` | Cognito Hosted UI domain                                                          |
| `NUXT_COGNITO_REDIRECT_URI`  | Must match Cognito allowed callback URL (`.../api/auth/callback`)                 |
| `NUXT_COGNITO_LOGOUT_URI`    | Must match Cognito allowed sign-out URL                                           |
