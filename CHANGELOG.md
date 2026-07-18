# Changelog

Change history for `muttum-app`, generated from Git commits and grouped by component version (`package.json`).

## [1.0.0] — unreleased

> Major version bumped manually (0.0.1 → 1.0.0); the changes below are those accumulated so far under this version.

### Added

- Live filtering of words shown in the "My dictionary" tab (`5df6ae0`)
- Android app icons (`c433abb`)
- Initial commit (`d1a81a0`, `9ae1911`)

### Fixed

- Style and sidebar (`fef8a2e`)
- `npm run lint` failing with "could not find config file" by migrating ESLint config to flat config (`eslint.config.js`) for ESLint 9
- Removed remaining `@typescript-eslint/no-explicit-any` lint errors in auth spec files and `zone-flags.ts`, previously undetected because lint wasn't running

### Documentation

- Doc update (MongoDB → PostgreSQL) (`bf485e2`)

### Other

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
