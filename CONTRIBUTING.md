# 🤝 Contribuer

De la prise d'une issue à la fusion de la PR. Pour installer le projet, voir le [README](README.md#-installation).

## 🔁 Cycle d'une contribution

1. Prendre une issue *Todo* dans le [Project](https://github.com/users/Miisterone/projects/5), se l'assigner et la passer *In Progress*. Noter son numéro `#<n>` et son identifiant `LL-<id>`.
2. Créer la branche depuis `develop` à jour : `git switch develop && git pull && git switch -c feature/<n>-<desc>`.
3. Commiter (voir [Commits](#-commits-et-titres-de-pr)).
4. Ouvrir une PR vers `develop`, avec `Closes #<n>` dans la description.
5. Obtenir 1 review approuvée et une CI verte, puis faire un **squash and merge** et supprimer la branche.

## 🌿 Branches (GitFlow)

| Branche | Créée depuis | Fusionnée vers |
|---|---|---|
| `main` : versions livrées, taguées | — | — |
| `develop` : intégration | `main` | — |
| `feature/<n>-<desc>` : fonctionnalité | `develop` | `develop` |
| `fix/<n>-<desc>` : correction en développement | `develop` | `develop` |
| `release/x.y.z` : stabilisation | `develop` | `main` et `develop` |
| `hotfix/<n>-<desc>` : correctif en production | `main` | `main` et `develop` |

- `main` et `develop` sont protégées : on passe toujours par une PR.
- `<n>` est le **numéro de l'issue** (`88` pour #88), sans `#` ni `LL-`. Il est obligatoire, car le workflow *Project* s'en sert pour déplacer la carte. Il faut donc une issue même pour une petite correction.
- `<desc>` : quelques mots en anglais, en minuscules, séparés par des tirets (`feature/88-profile-page`).

## 📝 Commits et titres de PR

[Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/), en anglais. Le titre de la PR devient le commit sur `develop` (squash). *PR check* le refuse s'il ne correspond pas à :

```regex
^(feat|fix|refactor|docs|test|ci|chore)(\((frontend|backend|database|infra)\))?: .+
```

```text
feat(frontend): add profile page [LL-142]
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Code modifié sans changement de comportement |
| `docs` | Documentation |
| `test` | Tests (unitaires, intégration, E2E) |
| `ci` | Workflows GitHub Actions |
| `chore` | Dépendances, configuration, scripts |

| Scope (facultatif) | Partie |
|---|---|
| `frontend` | Application React, stories, tests E2E |
| `backend` | API Next.js |
| `database` | Schéma Prisma, migrations, seed |
| `infra` | Docker, compose, déploiement |

Il n'y a pas d'autre type ni d'autre scope : `style`, `wip`, `(api)`, `(e2e)`, `(ui)` sont refusés. Si la modification touche tout le projet, on ne met pas de scope (`ci: update workflow`).

Pour la description : impératif présent, sans majuscule ni point final. L'identifiant `[LL-xxx]` va **à la fin** du titre.

| ❌ Refusé | ✅ Accepté |
|---|---|
| `[LL-189] fix(frontend): fix padding` | `fix(frontend): fix padding [LL-189]` |
| `test(e2e): audit pages` | `test(frontend): audit pages` |
| `feat(api): add events route` | `feat(backend): add events route` |
| `Feat(frontend):add button` | `feat(frontend): add button` |

## 🔀 Pull Requests

Avant d'ouvrir la PR, suivre la checklist du [modèle de PR](.github/pull_request_template.md). Les points principaux :

- `npm test` passe en local ;
- le rendu est vérifié en 800×600 ;
- Storybook, Swagger et le catalogue d'erreurs sont à jour si besoin.

En review :

- pointer la ligne et proposer une solution ;
- commenter le code, pas la personne ;
- préfixer par `nit:` ce qui n'est pas bloquant.

## 📦 Versions

[Semantic Versioning](https://semver.org/lang/fr/) : `MAJEUR.MINEUR.CORRECTIF`. Les versions sont en `0.x.y` jusqu'au MVP, qui sera la `1.0.0`.

**Release :**

1. Créer `release/x.y.z` depuis `develop`. On n'y fait que des correctifs.
2. Fusionner la branche dans `main`.
3. Taguer : `git tag vx.y.z && git push origin vx.y.z`. La release GitHub et les images Docker sont créées automatiquement.
4. Reporter la branche dans `develop`, puis la supprimer.

**Hotfix :**

1. Créer `hotfix/<n>-<desc>` depuis `main` et ouvrir une PR vers `main`.
2. Après la fusion, taguer un correctif (`v1.0.1`).
3. Reporter le correctif dans `develop`, et dans la `release/*` en cours s'il y en a une.

## 📖 Documenter une route (Swagger)

Swagger (`/api/docs`) est généré par [backend/lib/openapi.js](backend/lib/openapi.js) à partir des schémas Zod.

1. Écrire le schéma Zod dans `backend/lib/schemas.js`. Il sert à la fois à la validation et à la doc.
2. Ajouter `route({ method, path, tags, summary, request, responses, codes })` dans `openapi.js`. `codes` liste les erreurs possibles du [catalogue](ERRORS.md).
3. Lancer `npm run docs` puis `npm test`. Un test échoue si une route n'est pas documentée.

## 🎨 Storybook et 800×600

Chaque composant de `frontend/src/components` a son fichier `*.stories.jsx`. Storybook s'ouvre sur le viewport **Gérard 800×600**, l'écran du [persona](docs/PERSONAS.md) Gérard : tout doit y être lisible, sans défilement horizontal. Les données de démo sont dans `frontend/src/stories/fixtures.js`.
