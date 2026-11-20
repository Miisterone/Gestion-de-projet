# 🏃 Sprints

Un sprint dure 2 semaines (champ **Sprint** du Project). Au sprint planning, on écrit l'objectif. À la fin du sprint, on écrit la rétro. Les règles sont dans [CONTRIBUTING.md](../CONTRIBUTING.md#-sprint).

| Sprint | Dates | Objectif |
|---|---|---|
| Sprint 0 | 09/11 → 22/11/2026 | Socle technique : base PostgreSQL, CI et recette, contrat d'erreur API, rendu 800×600, Storybook et Swagger |
| Sprint 1 | 23/11 → 06/12/2026 | Fil du quartier (publier, fil paginé par zone), page profil, affichage des erreurs côté front |
| Sprint 2 | 07/12 → 20/12/2026 | *À définir au sprint planning* |
| Sprint 3 | 21/12/2026 → 03/01/2027 | *À définir au sprint planning* |
| Sprint 4 | 04/01 → 17/01/2027 | *À définir au sprint planning* |

## Modèle

```markdown
## Sprint N (jj/mm → jj/mm)

**Objectif :** …
**Engagé / livré :** … J/H engagés, … J/H Done (somme des Estimate)

### Rétro
- 👍 Ce qui a marché : …
- 👎 Ce qui a gêné : …
- 🎯 Actions (une personne, une issue) : …
```

## Sprint 0 (09/11 → 22/11)

**Objectif :** socle technique (base PostgreSQL, CI et recette, contrat d'erreur API, rendu 800×600, Storybook et Swagger).

### Rétro

- 👍 Le cadre est clair : modèle de PR, contrôles de CI sur les branches et les titres, automatisation du Project.
- 👎 Travail depuis un fork non documenté, règle de fusion floue (squash ou merge commit).
- 👎 Tickets sans critères d'acceptation : des décisions produit ont été prises seul, puis validées en review.
- 👎 Liens *Blocked by* faux, règles changées en cours de sprint.
- 👎 US en parallèle sur les mêmes fichiers (`openapi.js`, `schemas.js`) : 7 fichiers en conflit au rebase.
- 👎 Pièges silencieux : branche sans numéro d'issue (la carte ne bouge pas), fins de ligne CRLF.
- 🎯 Actions faites : doc du fork (#176), squash imposé, Definition of Ready (#176), OpenAPI et schémas par ressource (#174), numéro d'issue obligatoire dans la branche (#158), `.gitattributes`, un code d'erreur par règle (#175), statuts du Project et recette (#185).
