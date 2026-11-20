# 🤝 Contribuer

De la prise d'une issue à la fusion de la PR. Pour installer le projet, voir le [README](README.md#-installation).

## 🔁 Cycle d'une contribution

1. Prendre une issue *Todo* dans le [Project](https://github.com/users/Miisterone/projects/5), se l'assigner et la passer *In Progress*. Noter son numéro `#<n>` et son identifiant `LL-<id>`. Une issue *Todo* est prête (voir [Definition of Ready](#-sprint)) : si ce n'est pas le cas, le signaler au PO avant de commencer.
2. Créer la branche depuis `develop` à jour : `git switch develop && git pull && git switch -c feature/<n>-<desc>`.
3. Commiter (voir [Commits](#-commits-et-titres-de-pr)).
4. Ouvrir une PR vers `develop`, avec `Closes #<n>` dans la description.
5. Obtenir 1 review approuvée et une CI verte, puis faire un **squash and merge** et supprimer la branche.

**Tenir le Project à jour.** Avant de commencer, **s'assigner l'issue** et la passer de *Todo* à *In Progress* à la main : c'est ce qui montre à l'équipe qui travaille sur quoi. La suite est automatique (*In Review* à l'ouverture de la PR, *To Test* à la fusion, *Done* à la fermeture de l'issue). Si la review demande des changements ou si la recette est KO, repasser l'issue en *In Progress*. Le détail des statuts est dans le [README](README.md#-workflow-des-tickets).
**Une issue = une branche = une PR.** On travaille sur les tâches (sous-issues), pas sur l'US entière : chaque tâche a sa PR, et l'US est terminée quand toutes ses tâches sont fusionnées. Le squash transforme la PR en un seul commit sur `develop` : les commits à l'intérieur de la PR sont libres.

**Une US en cours par personne.** On finit et on fait fusionner ses PR avant d'en commencer une autre. Les petites PR sont relues et fusionnées vite, pour limiter les conflits entre US en parallèle.

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

## 🍴 Travailler depuis un fork

Sans droit d'écriture sur le dépôt, on pousse ses branches sur son fork. Les règles de branche, de titre et de PR sont les mêmes.

```bash
gh repo fork Miisterone/Gestion-de-projet --clone   # origin = le fork, upstream = le dépôt
git switch -c feature/<n>-<desc> upstream/develop
git push -u origin feature/<n>-<desc>
gh pr create --repo Miisterone/Gestion-de-projet --base develop --head <compte>:feature/<n>-<desc>
```

- `--head <compte>:<branche>` est obligatoire, sinon `gh pr create` cherche la branche dans le dépôt.
- Mettre sa branche à jour depuis `upstream/develop` (`git fetch upstream && git rebase upstream/develop`), pas depuis le `develop` du fork.
- Pour un premier contributeur, GitHub attend qu'un mainteneur clique sur **Approve and run workflows** avant de lancer la CI. Le signaler dans la PR si la CI ne démarre pas.
- *PR check* (nom de branche, titre, labels) utilise `pull_request_target` : il fonctionne aussi sur les PR venant d'un fork.

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

## 🏃 Sprint

**Definition of Ready.** Une issue passe en *Todo* au sprint planning seulement si elle a :

- des critères d'acceptation au format *Étant donné / Quand / Alors*, qui tranchent les règles produit (qui peut faire quoi, combien de fois, que se passe-t-il pour un compte incomplet...) ;
- les cas d'erreur attendus, avec leur code du [catalogue](ERRORS.md) ou « nouveau code à créer » ;
- pour une tâche front, le rendu attendu en 800×600 (maquette, capture ou description) ;
- des liens *Blocked by* vrais : chaque bloqueur est fait, ou prévu avant dans le même sprint.

**Sprint planning.** On relit les liens *Blocked by* des issues choisies et on retire ceux qui ne sont plus vrais. Une issue bloquée par une issue qui n'est pas dans le sprint n'entre pas dans le sprint.

**Changer une règle** (convention, CI, modèle de PR...) : la PR est annoncée à toute l'équipe avant sa fusion, et la règle s'applique au sprint suivant. Une règle qui casse la CI des PR en cours (nouvelle vérification) attend la fin du sprint, sauf correctif urgent.

## 🤖 PR de Dependabot

Dependabot ouvre ses PR (`chore: bump <paquet> from <a> to <b>`) sans issue : *PR check* ne les vérifie pas, et elles n'apparaissent pas dans le Project. Pour garder une trace dans le backlog, chaque PR Dependabot a une **issue de suivi** :

1. Chercher une issue de suivi existante (label `dependencies`). Les PR qui touchent les mêmes paquets (`vitest` et `@vitest/*`, `vite` et `@vitejs/*`...) partagent **une seule issue**.
2. Sinon, créer l'issue avec le modèle *Tâche* :
   - ce que propose la PR (paquet, versions, fichiers touchés), et si c'est une version majeure ;
   - si la CI de la PR échoue : le job, l'erreur et sa cause ;
   - critères *Étant donné / Quand / Alors* (CI verte, `npm test` passe, l'application fonctionne comme avant, PR liées fusionnées ou fermées) ;
   - cas d'erreur (`Aucun changement` en général) et dépendances.
3. Labels `infra` et `dependencies`. Dans le Project : Status `Backlog`, Service `Infra`, Persona `Aucun`. Si le workflow *Project* n'a pas ajouté l'issue, l'ajouter à la main : `gh project item-add 5 --owner Miisterone --url <url de l'issue>`.
4. Commenter la PR Dependabot avec le lien vers l'issue.

Une PR Dependabot fusionnée ou fermée sans suite ferme son issue (avec un lien vers la PR). Si la montée demande du travail (code à adapter, autres paquets à monter), il se fait dans une branche `feature/<n>-<desc>` liée à l'issue, et la PR Dependabot est fermée.

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

Swagger (`/api/docs`) est généré par [backend/lib/openapi/](backend/lib/openapi/) à partir des schémas Zod. Schémas et doc ont **un fichier par ressource** (`posts.js`, `events.js`...) : deux US en parallèle ne modifient pas le même fichier.

1. Écrire le schéma Zod dans `backend/lib/schemas/<ressource>.js`. Il sert à la fois à la validation et à la doc. Pour une nouvelle ressource, ajouter son `export *` dans `schemas/index.js`.
2. Ajouter `route({ method, path, tags, summary, request, responses, codes })` dans `backend/lib/openapi/<ressource>.js`. `codes` liste les erreurs possibles du [catalogue](ERRORS.md). Pour une nouvelle ressource, l'importer dans `openapi/index.js`.
3. Lancer `npm run docs` puis `npm test`. Un test échoue si une route n'est pas documentée.

## 🎨 Storybook et 800×600

Chaque composant de `frontend/src/components` a son fichier `*.stories.jsx`. Storybook s'ouvre sur le viewport **Gérard 800×600**, l'écran du [persona](docs/PERSONAS.md) Gérard : tout doit y être lisible, sans défilement horizontal. Les données de démo sont dans `frontend/src/stories/fixtures.js`.
