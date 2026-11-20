## Issue

Closes #<!-- numéro de l'issue -->

## Description

<!-- Qu'est-ce qui a été fait ? -->

## Captures

<!-- Pour un changement d'interface : capture en 800×600 -->

## Checklist

- [ ] Branche `feature/<n>-…` ou `fix/<n>-…` créée depuis `develop` à jour
- [ ] Titre au format Conventional Commits, `[LL-xxx]` à la fin (voir [CONTRIBUTING](https://github.com/Miisterone/Gestion-de-projet/blob/develop/CONTRIBUTING.md#-commits-et-titres-de-pr))
- [ ] `npm test` passe en local
- [ ] Rendu vérifié en **800×600** (Storybook ou E2E), sans défilement horizontal
- [ ] Composant modifié : story à jour
- [ ] Route modifiée : Swagger à jour (`backend/lib/openapi/`), `npm run docs` lancé
- [ ] Nouvelle erreur : code ajouté dans `backend/lib/errors.js`, `npm run docs` lancé (met à jour `ERRORS.md`)
- [ ] Aucun `detail` ne change le sens d'un code d'erreur (voir [ERRORS.md](https://github.com/Miisterone/Gestion-de-projet/blob/develop/ERRORS.md))
