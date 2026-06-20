# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200
npm run build      # production build to www/
npm test           # Karma/Jasmine unit tests (headless Chrome)
npm run lint       # ESLint with Angular-ESLint rules
ng test --include='**/search/**'  # run tests for a specific feature
```

The backend API must be running at `http://localhost:3000/api` (see `src/environments/environment.ts`). This is a Capacitor app — `www/` is the web output directory used by native builds.

## Architecture

This is an **Ionic/Angular** mobile app (French dictionary / vocabulary tracker) backed by a REST API. It uses NgModule-based Angular (not standalone components).

### Module layout

```
src/app/
  core/          # Singleton services, guards, interceptors, shared models
  features/      # Lazy-loaded page modules (one folder per route)
  tabs/          # Shell component wrapping the three main tab routes
```

**`core/`** contains everything that is provided at root and shared app-wide:
- `services/auth.service.ts` — JWT auth; persists token + user in `localStorage` under keys `muttum_token` / `muttum_user`. Exposes `currentUser$` (BehaviorSubject) and `isAuthenticated` (sync getter).
- `services/word.service.ts` — CRUD wrapper around `/api/words`. The search endpoint (`GET /words/search?word=`) returns a `UserWordPopulated` (the backend creates the user–word association on first search).
- `services/theme.service.ts` — light/dark toggle; persists choice in `localStorage` (`muttum_theme`), falls back to `prefers-color-scheme`.
- `interceptors/auth.interceptor.ts` — attaches `Authorization: Bearer <token>` to every outgoing request when a token is present.
- `guards/auth.guard.ts` / `guest.guard.ts` — route protection; `AuthGuard` redirects unauthenticated users to `/auth/login`.

**`features/`** each map to a lazy-loaded route:
- `auth/` — login and register pages, protected by `GuestGuard`
- `search/` — word lookup (tab 1)
- `dictionary/` — user's saved word list (tab 2)
- `profile/` — account info + theme toggle (tab 3)
- `word-detail/` — full detail view, routed from `/word/:id`

### Data model

The backend has two core entities:
- `Word` — canonical dictionary entry (`_id`, `word`, `definitions[]`, `source`)
- `UserWord` — join between a user and a word (`userId`, `wordId`, `notes`, `tags`, `favorite`, search metadata)

The API always returns `UserWordPopulated` (with `wordId` resolved to a full `Word` object) rather than bare `UserWord`.

### Routing

- Default redirect: `/` → `/tabs/search`
- Unauthenticated: redirected to `/auth/login`
- `word/:id` is a full-screen route outside the tabs shell

### Styling

Global styles in `src/global.scss`; Ionic CSS variables in `src/theme/variables.scss`. Dark mode is toggled by adding the `ion-palette-dark` class to `<html>` — do not use `[data-theme]` or media queries for dark mode logic; the `ThemeService` owns that toggle.
