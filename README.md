# Muttum App

Mobile French dictionary and vocabulary tracker built with Ionic/Angular and Capacitor.

## Prerequisites

- Node.js 18+
- [Ionic CLI](https://ionicframework.com/docs/intro/cli): `npm install -g @ionic/cli`
- The backend API must be running at `http://localhost:3000/api`

## Installation

```bash
npm install
```

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build to www/
npm test           # Karma/Jasmine unit tests (headless Chrome)
npm run lint       # ESLint with Angular-ESLint rules
```

To target a subset of tests:

```bash
ng test --include='**/search/**'
```

## Architecture

```
src/app/
  core/          # Singleton services, guards, interceptors, shared models
  features/      # Lazy-loaded page modules (one folder per route)
  tabs/          # Shell component wrapping the three main tab routes
```

### `core/`

| File | Role |
|---|---|
| `services/auth.service.ts` | JWT auth — persists token and user in `localStorage` (`muttum_token` / `muttum_user`). Exposes `currentUser$` and the sync getter `isAuthenticated`. |
| `services/word.service.ts` | CRUD wrapper around `/api/words`. The search endpoint (`GET /words/search?word=`) returns a `UserWordPopulated` and creates the user–word association on the first call. |
| `services/theme.service.ts` | Light/dark toggle — persists the choice in `localStorage` (`muttum_theme`), falls back to `prefers-color-scheme`. |
| `interceptors/auth.interceptor.ts` | Attaches `Authorization: Bearer <token>` to every outgoing request when a token is present. |
| `guards/auth.guard.ts` | Redirects unauthenticated users to `/auth/login`. |
| `guards/guest.guard.ts` | Redirects authenticated users away from public pages (login, register). |

### `features/`

| Folder | Route | Description |
|---|---|---|
| `auth/` | `/auth/login`, `/auth/register` | Login and register pages |
| `search/` | `/tabs/search` | Tab 1 — word lookup |
| `dictionary/` | `/tabs/dictionary` | Tab 2 — saved word list |
| `profile/` | `/tabs/profile` | Tab 3 — account info and theme toggle |
| `word-detail/` | `/word/:id` | Full-screen detail view |

### Data model

- `Word` — canonical dictionary entry (`id`, `word`, `definitions[]`, `source`)
- `UserWord` — join between a user and a word (`userId`, `wordId`, `notes`, `tags`, `favorite`, search metadata)

The API always returns `UserWordPopulated` (with `wordId` resolved to a full `Word` object).

### Routing

- Default redirect: `/` → `/tabs/search`
- Unauthenticated: redirected to `/auth/login`
- `/word/:id` is a full-screen route outside the tabs shell

### Styling

- Global styles: `src/global.scss`
- Ionic CSS variables: `src/theme/variables.scss`
- Dark mode is toggled by adding the `ion-palette-dark` class to `<html>` — the `ThemeService` owns that toggle.

## Docker

The production image is a two-stage build: Angular is compiled by Node, then the `www/` output is served by Nginx. Nginx also proxies `/api/*` to the backend container — this is why `environment.prod.ts` uses a relative path (`/api`) rather than `http://localhost:3000`.

```
[Browser]
    ↓
[Nginx :80]
  ├── /*     → static Angular build (www/)
  └── /api/* → proxy → [backend :3000]
                              ↓
                        [PostgreSQL :5432]
```

**Build the image standalone:**

```bash
docker build -t muttum-frontend .
docker run -p 80:80 muttum-frontend
```

**Run the full stack** (frontend + backend + PostgreSQL + Portainer) from the `projets/` parent directory:

```bash
cp ../.env.example ../.env
# edit ../.env — set JWT_SECRET at minimum
docker compose up --build
```

| URL | Service |
|---|---|
| `http://localhost` | Application |
| `http://localhost:9000` | Portainer (container management UI) |

Key files:
- `Dockerfile` — multi-stage build (Node builder → Nginx)
- `nginx.conf` — SPA fallback + `/api/` reverse proxy to `backend:3000`
- `.dockerignore` — excludes `node_modules`, `www/`, `.angular/`

## Native build (Capacitor)

`www/` is the web output directory used by native builds.

```bash
npm run build
npx cap sync          # Sync www/ to iOS/Android projects
npx cap open ios      # Open Xcode
npx cap open android  # Open Android Studio
```
