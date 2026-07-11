# Changelog

Historique des modifications de `muttum-app`, généré à partir des commits Git et regroupé par version de composant (`package.json`).

## [1.0.0] — non publiée

> Version majeure incrémentée manuellement (0.0.1 → 1.0.0) ; les modifications ci-dessous sont celles accumulées jusqu'ici sous cette version.

### Ajout

- Filtrage à la volée des mots affichés dans l'onglet "Mon dictionnaire" (`5df6ae0`)
- Icônes de l'application Android (`c433abb`)
- Commit initial (`d1a81a0`, `9ae1911`)

### Correction

- Style et barre latérale (`fef8a2e`)

### Documentation

- Mise à jour de la doc (MongoDB → PostgreSQL) (`bf485e2`)

### Divers

- Mise à jour du thème et du logo (`fe05b72`)
- Renommage de l'application en "muttum" (`dbaa59f`)
- Configuration locale pour cibler le backend de prod, ajout du support iOS (`ebaae73`)
- Retrait de `environment.prod.ts` du suivi Git, ajout d'un fichier `.example` (`b3e9c8d`)
- Nouveau logo (`2f09b69`)
- Migration vers Jest + formulaires à base de signals (`32795a9`)
- Amélioration de l'accessibilité (`b4e8bd4`)
- Utilisation d'Observables plutôt que de Promises (`d23fc3c`)
- Refactorisation vers des "dumb components" (`3720954`)
- Ajout de la conteneurisation Docker (`73f3516`)
- Génération du client API via Orval à partir du backend (`ed31b35`)
- Utilisation de fonctionnalités Angular modernes (`6a682a1`)
- Migration vers Angular 22 (`3f7c628`)
