## Issue

Closes #<!-- numéro de l'issue -->

## Description

<!-- Qu'est-ce qui a été fait ? -->

## Captures

<!-- Pour un changement d'interface : capture en 800×600 -->

## Checklist

- [ ] La branche part de `develop` à jour
- [ ] La branche respecte le format (`feature/<n>-...`, `fix/<n>-...`, `<n>` = numéro de l'issue)
- [ ] Le titre de la PR suit strictement Conventional Commits (types: `feat`, `fix`, `refactor`, `docs`, `test`, `ci`, `chore` | scopes autorisés: `frontend`, `backend`, `database`, `infra` ou aucun scope)
- [ ] Le titre est en anglais à l'impératif, sans majuscule initiale, ticket `[LL-xxx]` à la fin s'il y en a un
- [ ] Testé en local, `npm test` passe
- [ ] Rendu vérifié en **800×600** (viewport « Gérard » de Storybook, ou test E2E), sans défilement horizontal
- [ ] Composant ajouté ou modifié : story Storybook à jour
- [ ] Route ajoutée ou modifiée : documentée dans Swagger (`backend/lib/openapi.js`), `npm run docs` lancé
- [ ] Nouvelle erreur : code ajouté au catalogue (`ERRORS.md`)
