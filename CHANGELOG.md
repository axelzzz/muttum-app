# Changelog

Change history for `muttum-app`, generated from Git commits and grouped by component version (`package.json`).

## [1.0.0] — unreleased

> Major version bumped manually (0.0.1 → 1.0.0); the changes below are those accumulated so far under this version.

### Added

- Live filtering of words shown in the "My dictionary" tab (`5df6ae0`)
- Android app icons (`c433abb`)
- Initial commit (`d1a81a0`, `9ae1911`)

### Removed

- Removed the password-reset flow (forgot-password/reset-password pages, routes, `AuthService.forgotPassword`/`resetPassword`, and related payload/response types) — no longer supported by the backend API

### Fixed

- `npm ci` failing on GitHub Actions (Node 22 / npm 10) with "Missing: chokidar@4.0.3 from lock file": `package-lock.json` had been regenerated locally with npm 11, which drops `@ionic/angular-toolkit`'s optional `chokidar@^4`/`readdirp@^4` fallback entries that npm 10 still requires; regenerated the lock file with npm 10 to match the CI environment
- Raised card/input/tab-bar border contrast in both themes (`--ion-border-color`: light ~1.1:1 → 3.15–3.45:1, dark ~1:1 → 4.23–5.17:1) and fixed the tag chip's alpha-blended border reading at ~1.5:1 despite an RGAA-compliant comment; all were below the RGAA 3.2 / WCAG 1.4.11 minimum of 3:1 for UI components
- Fixed field-level error messages not being visible on any auth form (register, login, forgot-password, reset-password): the `<ion-note slot="error">` pattern doesn't render (Ionic 8's `ion-item` has no matching slot), and `ion-input`'s native `errorText`/`ion-invalid` class approach was silently wiped by the component's own re-render whenever `errorText` changed; replaced with a plain, Angular-owned `<p class="field-error-text" role="alert">` rendered as a sibling of the field, wired to it via `aria-describedby`
- Search in the "My dictionary" tab now queries the full server-side word list instead of only filtering the words already loaded on the client
- Show the "email already used" error under the email field on the account creation page instead of only as a generic toast
- Show server-side field validation errors (username/email/password) under the relevant field, and a dedicated rate-limit message, across register, login, forgot-password, and reset-password
- Mirror the backend's username (≤50) and password (≤128) max-length limits in client-side validation on the register and reset-password forms
- Distinguish an expired/invalid reset link from a plain password validation failure on the reset-password page, instead of showing the same message for both
- Replaced the placeholder "M" badge on the account creation page with the official Greek-lettered wordmark logo (`assets/logo.svg`)
- Replaced the placeholder "M" badge on the login, forgot-password, and reset-password pages with the official wordmark logo (`assets/logo.svg`), matching the account creation page
- Replaced the redundant "Muttum" `<h1>` on the login page (the logo above it already carries the brand name) with "Connexion", matching the page-specific heading pattern used on the other auth pages
- Gave every route a distinct, descriptive document `<title>` (RGAA 8.5 / WCAG 2.4.2) instead of the static one from `index.html` applying everywhere; the word detail page updates its title dynamically once the word loads
- Style and sidebar (`fef8a2e`)
- `npm run lint` failing with "could not find config file" by migrating ESLint config to flat config (`eslint.config.js`) for ESLint 9
- Removed remaining `@typescript-eslint/no-explicit-any` lint errors in auth spec files and `zone-flags.ts`, previously undetected because lint wasn't running

### Documentation

- Doc update (MongoDB → PostgreSQL) (`bf485e2`)

### Other

- Removed duplicated form-validation, password-visibility-toggle, and submit-pipeline logic across the login, register, forgot-password, and reset-password pages by extracting shared helpers (`field-validators.util.ts`, `password-visibility.util.ts`, `auth-form-submit.util.ts` in `features/auth/`, and `fieldErrorMessage` in `ui/field-error.util.ts`); no behavior change, all existing tests pass unmodified
- Migrated from the deprecated Webpack-based `@angular-devkit/build-angular` builders to the esbuild-based `@angular/build` builders (`application`/`dev-server`/`extract-i18n`), and removed the pinned `.browserslistrc` in favor of Angular's built-in "baseline widely available" browser support policy, to clear the CLI's build-system-deprecation and unsupported-browser warnings
- Show a single usage example per definition instead of a list, matching the backend's change to store only the first Wiktionary example
- Chain the release pipeline into deploy: it now calls `deploy-android.yml` with the exact release commit SHA once the release commit is pushed, instead of relying on the tag push to trigger it separately
- Extract a reusable `build` pipeline (lint + build + test + coverage + Sonar scan), called as a prerequisite by the deploy and release pipelines instead of duplicating those steps
- Add SonarCloud analysis (coverage + quality gate) and README badges
- Theme and logo update (`fe05b72`)
- Renamed the app to "muttum" (`dbaa59f`)
- Local config to target the prod backend, added iOS support (`ebaae73`)
- Removed `environment.prod.ts` from Git tracking, added an `.example` file (`b3e9c8d`)
- New logo (`2f09b69`)
- Migration to Jest + signal-based forms (`32795a9`)
- Accessibility improvements (`b4e8bd4`)
- Use Observables instead of Promises (`d23fc3c`)
- Refactor into "dumb components" (`3720954`)
- Added Docker containerization (`73f3516`)
- API client generation via Orval from the backend (`ed31b35`)
- Use of modern Angular features (`6a682a1`)
- Migration to Angular 22 (`3f7c628`)
