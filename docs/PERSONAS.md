# Personas

Quatre personas cibles pour LocalLoop, réseau social de proximité. Les personas 1 et 2 sont imposés, les personas 3 et 4 sont choisis par l'équipe.

Source : page « Personna » du Notion LocalLoop. Ce fichier fait référence pour le dépôt : en cas de changement, mettre à jour les deux.

| Persona | Âge | Type | Besoin principal | Fonctionnalités MVP clés | Label GitHub |
| --- | --- | --- | --- | --- | --- |
| 👴 Gérard | 68 ans | Imposé | Suivre la vie du quartier malgré un vieux matériel | Fil local, commentaires, événements | `persona:gerard` |
| 🏆 Inès | 22 ans | Imposé | Voir l'impact de ses contributions | Publications, réactions, statistiques | `persona:ines` |
| 🔒 Chloé | 26 ans | Personnalisé | Participer sans exposer sa vie privée | Profil, visibilité, signalement | `persona:chloe` |
| 🎪 Karim | 45 ans | Personnalisé | Faire venir les habitants aux événements de son association | Événements, participation, recherche par zone | `persona:karim` |

## Utilisation dans la gestion de projet

- Chaque EPIC et chaque user story indique le ou les personas qu'elle sert (champ **Persona** des modèles d'issue), et porte le label `persona:*` correspondant.
- Dans le GitHub Project, le champ **Persona** (Gérard, Inès, Chloé, Karim, Plusieurs, Aucun) sert à grouper ou trier une vue. Une EPIC qui sert plusieurs personas prend la valeur « Plusieurs », et ses labels `persona:*` précisent lesquels. Pour voir tout ce qui concerne un persona, filtrer par label (`label:persona:karim`).
- Une user story s'écrit du point de vue d'un persona : *En tant que Karim, je veux… afin de…*.
- Les critères d'acceptation reprennent les contraintes de la section « Ce que ça implique » du persona (par exemple : rendu vérifié en 800×600 pour Gérard).

---

## Persona 1 (imposé) : Gérard, 68 ans, l'écran cathodique

- **Profil :** retraité, ancien comptable, vit dans le quartier depuis 30 ans. Il utilise un vieux PC avec un écran CRT en **800×600** et une connexion lente.
- **Objectif :** suivre les actualités de son quartier (travaux, marché, fête des voisins) et répondre aux voisins qui demandent de l'aide.
- **Frustrations :** boutons coupés hors de l'écran, défilement horizontal, texte trop petit, pages lentes à charger.
- **Citation :** *« Quand le bouton "Publier" disparaît à droite, je ne sais plus quoi faire. »*
- **Ce que ça implique dans le projet :**
  - Mise en page responsive testée en **800×600** (un viewport Playwright dédié et une story Storybook à cette taille).
  - Aucun défilement horizontal, police de base ≥ 16px, cibles cliquables ≥ 44px.
  - Images légères (lazy loading) et pagination du fil d'actualité local.
  - Messages d'erreur en clair, jamais de code technique comme « Error 500 » affiché tel quel (voir [ERRORS.md](../ERRORS.md)).

## Persona 2 (imposé) : Inès, 22 ans, stats et gamification

- **Profil :** étudiante, arrivée dans le quartier il y a un an, publie presque tous les jours (bons plans, objets à donner, coups de main).
- **Objectif :** voir l'impact de ses publications et se sentir récompensée de s'investir pour ses voisins.
- **Frustrations :** elle ne sait pas ce qui est utile aux autres et n'a aucune raison de revenir chaque jour.
- **Citation :** *« J'aimerais savoir combien de voisins ont réagi à mes posts cette semaine, et avoir un badge quand j'aide 7 jours d'affilée. »*
- **Ce que ça implique dans le projet :**
  - Back : un endpoint `GET /api/users/:id/stats` (publications, réactions reçues, commentaires, série de jours consécutifs).
  - Back : un système de badges simple (première publication, 10 réactions, série de 7 jours). Première brique de la réputation communautaire prévue en V2.
  - Front : une page « Mes statistiques » avec compteurs et badges affichés sur le profil.

## Persona 3 : Chloé, 26 ans, soucieuse de sa vie privée

- **Profil :** jeune active, vit seule dans une résidence. Elle veut participer à la vie locale mais refuse que des inconnus sachent où elle habite.
- **Objectif :** publier et échanger avec ses voisins en gardant le contrôle sur ce qu'elle montre.
- **Frustrations :** les applications qui affichent une localisation précise, les profils publics par défaut, les messages déplacés sans moyen de les signaler.
- **Citation :** *« Je veux bien dire que je suis du quartier, pas donner mon adresse. »*
- **Ce que ça implique dans le projet :**
  - Zone géographique au niveau du quartier, jamais d'adresse précise affichée (voir [DATABASE.md](DATABASE.md)).
  - Visibilité des publications au choix : public / quartier / privé.
  - Paramètres de profil (champs masquables) et collecte de données minimale (RGPD).
  - Bouton « Signaler » sur chaque publication et commentaire, relié à la modération.

## Persona 4 : Karim, 45 ans, président d'association

- **Profil :** président bénévole d'une association de quartier (vide-greniers, ateliers, fête des voisins). Il communique aujourd'hui par affiches et par un groupe Facebook où ses annonces se perdent.
- **Objectif :** annoncer ses événements aux habitants concernés et savoir combien de personnes vont venir.
- **Frustrations :** les annonces noyées dans le flux, l'absence de visibilité sur le nombre de participants, une audience trop large qui n'habite pas le quartier.
- **Citation :** *« Je veux toucher les gens d'ici, et savoir s'il faut prévoir 20 ou 100 chaises. »*
- **Ce que ça implique dans le projet :**
  - Création d'événements (titre, date, lieu, description, photo) rattachés à une zone.
  - Bouton « Je participe » et compteur de participants visible par l'organisateur.
  - Liste des événements à venir filtrable par zone.
  - Événements mis en avant dans le fil d'actualité local.
