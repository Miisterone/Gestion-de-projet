# 🤝 Contribuer au projet

Ce guide décrit **comment travailler sur le projet** : de la prise d'une issue jusqu'à la fusion de la Pull Request.
Pour installer le projet, voir le [README](README.md#-installation).

## Sommaire

- [Cycle de vie d'une contribution](#-cycle-de-vie-dune-contribution)
- [Branches](#-branches)
- [Commits](#-commits)
- [Pull Requests](#-pull-requests)
- [Livrer une version](#-livrer-une-version)
- [Correctif urgent (hotfix)](#-correctif-urgent-hotfix)

---

## 🔁 Cycle de vie d'une contribution

1. **Prendre une issue** dans le [Project](https://github.com/users/Miisterone/projects/5) (colonne *À faire*), se l'assigner, la passer *En cours*. Noter son numéro `#<n>` (pour la branche et le `Closes #<n>`) et son identifiant `LL-<id>` (dans le titre, pour le titre de la PR).
2. **Créer sa branche** depuis `develop` à jour :
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/88-profile-page
   ```
3. **Développer** en faisant des commits cohérents (voir [Commits](#-commits)).
4. **Ouvrir une Pull Request** vers `develop` (voir [Pull Requests](#-pull-requests)).
5. **Faire valider** la review et les contrôles CI : lint, tests, build.
6. **Fusionner** la PR puis **supprimer** la branche.

---

## 🌿 Branches

Nous suivons **GitFlow**.

| Branche | Rôle | Créée depuis | Fusionnée vers |
|---|---|---|---|
| `main` | Versions stables livrées, taguées | — | — |
| `develop` | Intégration des développements | `main` à l'initialisation | — |
| `feature/<n>-<desc>` | Nouvelle fonctionnalité | `develop` | `develop` |
| `fix/<n>-<desc>` | Correction pendant le développement | `develop` | `develop` |
| `release/x.y.z` | Stabilisation d'une version | `develop` | `main` **et** `develop` |
| `hotfix/<n>-<desc>` | Correction urgente en production | `main` | `main` **et** `develop` |

> `fix/*` est une convention complémentaire au GitFlow standard, propre à notre projet.

### Protection

`main` et `develop` sont **protégées** : aucun push direct, toute modification passe par une Pull Request.

### Nommage

- `<n>` = numéro de l'issue dans le backlog (ex. `88` pour l'issue #88 *LL-142 Page profil*), sans `#` ni `LL-`.
- `<desc>` : quelques mots **en anglais**, **en minuscules**, séparés par des **tirets**.

> ⚠️ Le workflow **`PR check`** refuse toute branche `feature/`, `fix/` ou `hotfix/` sans numéro d'issue : créer d'abord l'issue, même pour une petite correction de CI ou de doc.

```text
feature/88-profile-page
fix/85-feed-duplicates
hotfix/31-login-crash
release/1.0.0
```

---

## ✍️ Commits & Titres de PR

Nous suivons rigoureusement la convention [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Les messages sont rédigés **en anglais**.

> ⚠️ **Contrôle automatique strict en CI :**
> Le workflow GitHub Actions **`PR check`** vérifie automatiquement le nom de votre branche et le titre de votre Pull Request (qui devient le message de commit lors du *squash and merge*).
> 
> La regex vérifiée par la CI est :
> ```regex
> ^(feat|fix|refactor|docs|test|ci|chore)(\((frontend|backend|database|infra)\))?: .+
> ```
> **Tout écart de syntaxe ou scope non reconnu fait échouer la CI.**

```text
type(scope): description [LL-<id>]
```

### Types autorisés (liste fermée)

| Type | Usage |
|---|---|
| `feat` | Ajout d'une fonctionnalité |
| `fix` | Correction d'un bug |
| `refactor` | Modification du code sans changement fonctionnel ni correctif |
| `docs` | Modification de la documentation |
| `test` | Ajout ou modification de tests (unitaires, intégration, E2E) |
| `ci` | Modification des pipelines CI/CD et workflows GitHub Actions |
| `chore` | Maintenance diverse (dépendances, configuration, scripts…) |

*(Les types comme `style`, `perf`, `build`, `wip`, `misc` ne sont **pas** autorisés par la CI).*

### Scopes autorisés (liste strictement fermée)

Seuls ces **4 scopes** (en minuscules) sont acceptés par la CI :

| Scope | Partie concernée | Exemples |
|---|---|---|
| `frontend` | Application React, composants, stories, tests E2E | `feat(frontend): add login form` |
| `backend` | API Next.js, routes, middlewares, contrôleurs | `fix(backend): validate jwt secret` |
| `database` | Schéma Prisma, migrations SQL, seed | `feat(database): add events table` |
| `infra` | Docker, compose, déploiement | `fix(infra): update node alpine image` |

> 💡 **Le scope est facultatif :** si votre modification concerne l'ensemble du projet ou ne rentre pas dans ces 4 scopes, **ne mettez pas de scope** (ex. `ci: update workflow`, `test: audit 800x600 views`).
>
> 🚫 **Attention aux pièges fréquents de scopes :**
> - Les tests E2E / Playwright doivent utiliser le scope `frontend` ou **aucun scope** (`test(frontend): ...` ou `test: ...`). **Le scope `(e2e)` fait échouer la CI.**
> - L'API doit utiliser `backend` (`(api)` fait échouer la CI).
> - N'inventez aucun autre scope (`ui`, `auth`, `router`, `lib`… sont interdits).

### Règles de syntaxe impératives

1. **Type et scope en minuscules :** `feat`, pas `Feat`.
2. **Deux-points et espace obligatoire :** `type(scope): description` (espace obligatoire après le `:`).
3. **Description en anglais à l'impératif présent :** `add`, `fix`, `remove`, `update` (pas de français, pas de passé `fixed`, pas de gérondif `adding`).
4. **Pas de majuscule au premier mot ni de point final :** `add login page` (et non `Add login page.`).
5. **Identifiant de ticket `[LL-xxx]` :**
   - ✅ **À la fin** : `test(frontend): audit every page in 800x600 [LL-189]`
   - ❌ **JAMAIS au début** : `[LL-189] test(frontend): ...` (fait échouer la regex CI car elle attend le `type` au début).

### ❌ Rejeté par la CI vs ✅ Accepté par la CI

| Ce qui fait échouer la CI ❌ | Ce qui est accepté ✅ | Pourquoi c'est rejeté ? |
|---|---|---|
| `test(e2e): audit pages` | `test(frontend): audit pages` ou `test: audit pages` | `e2e` n'est pas un scope valide (seuls `frontend`, `backend`, `database`, `infra` le sont). |
| `[LL-189] fix(frontend): fix padding` | `fix(frontend): fix padding [LL-189]` | Le message doit obligatoirement commencer par le type (`feat`, `fix`…). |
| `feat(api): add events route` | `feat(backend): add events route` | `api` n'est pas un scope valide, utiliser `backend`. |
| `feat(frontend):add button` | `feat(frontend): add button` | Espace manquant après `:`. |
| `Feat(frontend): add button` | `feat(frontend): add button` | Le type doit être en minuscules. |
| `fix(frontend): corriger affichage` | `fix(frontend): fix layout display` | La description doit être rédigée en anglais. |
| `wip: test in progress` | `test(frontend): add draft tests` | `wip` n'est pas un type valide. |

---

## 🔀 Pull Requests

### Titre de la PR

Le titre de la Pull Request est soumis **exactement aux mêmes règles Conventional Commits que ci-dessus**, car c'est lui qui sera utilisé comme nom du commit final sur `develop` / `main` lors du *squash and merge*.

```text
feat(frontend): add profile page [LL-142]
```

La description de la PR contient **`Closes #<n>`** (numéro de l'issue) pour lier et fermer l'issue automatiquement à la fusion :

```markdown
Closes #88
```

### Avant d'ouvrir la PR

- [ ] La branche est à jour avec `develop`.
- [ ] `npm run lint` et `npm test` passent en local.
- [ ] Les nouveaux comportements sont testés.
- [ ] La documentation est à jour si besoin (README, Storybook, Swagger).

### Règles de fusion

- **1 review approuvée** minimum.
- **CI verte** : lint, tests, build.
- Fusion par **squash and merge**, puis suppression de la branche.

### Faire une review

- Être **précis** : pointer la ligne et proposer une solution.
- Être **bienveillant** : on commente le code, pas la personne.
- Distinguer le **bloquant** du **suggéré** (préfixe `nit:` pour un détail non bloquant).

---

## 📦 Livrer une version

Les versions suivent le **[Semantic Versioning](https://semver.org/lang/fr/)** : `MAJEUR.MINEUR.CORRECTIF`.

| Incrément | Quand | Exemple |
|---|---|---|
| **MAJEUR** | Changement incompatible (API cassée) | `1.4.2` → `2.0.0` |
| **MINEUR** | Nouvelle fonctionnalité compatible | `1.4.2` → `1.5.0` |
| **CORRECTIF** | Correction de bug | `1.4.2` → `1.4.3` |

Tant que le MVP n'est pas livré, les versions sont en `0.x.y`. Le MVP sera la `1.0.0`.

### Étapes

1. Créer `release/x.y.z` depuis `develop`. Aucune nouvelle fonctionnalité n'y est ajoutée, seulement des correctifs et la préparation de la livraison.
2. Fusionner la release dans `main`.
3. Ajouter le tag : `git tag v1.0.0 && git push origin v1.0.0`.
4. Reporter les changements dans `develop`.
5. Supprimer la branche de release.

---

## 🚑 Correctif urgent (hotfix)

1. Créer `hotfix/<n>-<desc>` depuis `main`.
2. Corriger, ouvrir une PR vers `main`.
3. Après fusion, taguer une version **CORRECTIF** (ex. `v1.0.1`).
4. Reporter le correctif dans `develop` et, si besoin, dans la `release/*` en cours.

---

## 📖 Documenter une route dans Swagger

La doc Swagger (`/api/docs`) est générée par [`backend/lib/openapi.js`](backend/lib/openapi.js) à partir des schémas Zod de validation.

1. Écrire le schéma Zod du corps dans `backend/lib/schemas.js` (il sert à la fois à valider et à documenter).
2. Ajouter un appel `route({ method, path, tags, summary, request, responses, codes })` dans `backend/lib/openapi.js`, avec dans `codes` les erreurs possibles du [catalogue](ERRORS.md).
3. Lancer `npm test` : un test échoue si une route de `backend/app/api` n'est pas documentée.

## 🎨 Storybook et rendu 800×600

Chaque composant de `frontend/src/components` a un fichier `*.stories.jsx` à côté de lui. Storybook (`npm run storybook -w frontend`) s'ouvre sur le viewport **Gérard 800×600** : c'est l'écran de référence du persona Gérard, tout doit y être lisible sans défilement horizontal. Les données de démonstration communes sont dans `frontend/src/stories/fixtures.js`.
