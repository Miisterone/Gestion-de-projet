# Erreurs de l'API

Toutes les erreurs de l'API ont le même format, décidé dans l'EPIC *Error management* : [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807) (`Content-Type: application/problem+json`) enrichie d'un code métier stable.

```json
{
  "type": "https://localloop.dev/errors/LL_VALIDATION_422",
  "title": "Certains champs sont invalides.",
  "status": 422,
  "code": "LL_VALIDATION_422",
  "detail": "Certains champs sont invalides.",
  "instance": "/api/posts",
  "traceId": "8f2c1e4a-...",
  "errors": [{ "field": "content", "code": "TOO_LONG", "message": "La publication ne doit pas dépasser 2000 caractères." }]
}
```

| Champ | Rôle |
|---|---|
| `code` | Code métier stable : c'est lui que le front teste, jamais le texte |
| `title` | Message court affichable à l'utilisateur, sans terme technique |
| `detail` | Précision sur ce cas (par défaut identique à `title`), jamais un autre sens que le code |
| `instance` | Route appelée |
| `traceId` | Identifiant de la requête, aussi renvoyé dans l'en-tête `X-Trace-Id` et écrit dans les logs serveur |
| `errors` | Erreurs 422 uniquement : une entrée par champ invalide (`field`, `code`, `message`) |

**Un cas que le front doit distinguer a son propre code.** `detail` sert seulement à préciser (ex. quel champ, quelle limite), jamais à changer le sens du code. S'il manque un code, on l'ajoute (voir [Ajouter un code](#ajouter-un-code)) au lieu de détourner un code proche avec `detail`. C'est vérifié en review.

Une exception non prévue renvoie toujours `500 LL_INTERNAL_500`, sans stack trace ni message interne. Le détail est dans les logs serveur, retrouvable avec le `traceId`.

## Catalogue des codes

Généré depuis [`backend/lib/errors.js`](backend/lib/errors.js) par `npm run docs`. La CI échoue si ce tableau n'est pas à jour.

<!-- catalogue:start (généré par npm run docs, ne pas modifier à la main) -->
| Code | HTTP | Message affiché | Quand |
|---|:-:|---|---|
| `LL_VALIDATION_422` | 422 | Certains champs sont invalides. | Corps absent, JSON illisible ou champ invalide (voir `errors`) |
| `LL_AUTH_401` | 401 | Votre session a expiré, reconnectez-vous. | Token absent, invalide ou expiré |
| `LL_LOGIN_401` | 401 | Email ou mot de passe incorrect. | Échec de connexion |
| `LL_AUTH_403` | 403 | Vous n'avez pas accès à ce contenu. | Action sur le contenu d'un autre (ex. supprimer la publication d'un autre) |
| `LL_REPORT_403` | 403 | Vous ne pouvez pas signaler votre propre publication. | Signalement de sa propre publication |
| `LL_POST_404` | 404 | Cette publication n'existe pas ou n'est plus disponible. | Publication inconnue |
| `LL_USER_404` | 404 | Cet utilisateur n'existe pas. | Utilisateur inconnu |
| `LL_ZONE_404` | 404 | Cette zone n'existe pas ou n'est pas encore ouverte. | Zone inconnue |
| `LL_EVENT_404` | 404 | Cet événement n'existe pas ou a été annulé. | Événement inconnu |
| `LL_EMAIL_409` | 409 | Cet email est déjà utilisé. | Inscription avec un email existant |
| `LL_REPORT_409` | 409 | Vous avez déjà signalé ce contenu. | Signalement en double |
| `LL_PROFILE_ZONE_409` | 409 | Choisissez votre quartier dans votre profil pour continuer. | Action qui demande un quartier (ex. créer un événement) depuis un compte qui n'en a pas |
| `LL_RATE_429` | 429 | Trop de tentatives, réessayez dans un instant. | Limitation de débit |
| `LL_INTERNAL_500` | 500 | Une erreur est survenue de notre côté. Réessayez. | Toute exception non prévue |
| `LL_NETWORK` | - | Connexion perdue. Vérifiez votre réseau. | Côté front uniquement : l'API n'a pas répondu |
<!-- catalogue:end -->

### Codes des erreurs de champ (`errors[].code`)

| Code | Signification |
|---|---|
| `REQUIRED` | Champ absent ou vide |
| `TOO_SHORT` / `TOO_LONG` | Longueur hors limites |
| `INVALID_EMAIL` | Email mal formé |
| `INVALID_ID` | Identifiant mal formé |
| `INVALID_TYPE` | Mauvais type (ex. nombre au lieu de texte) |
| `INVALID_FORMAT` / `INVALID_VALUE` | Format ou valeur non acceptés |
| `INVALID_JSON` | Le corps de la requête n'est pas du JSON (champ `body`) |

## Écrire une route

```js
import { requireUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/handler';
import { parseBody } from '@/lib/validation';
import { z } from 'zod';

const reportSchema = z.object({ reason: z.enum(['abus', 'inapproprie', 'erronee', 'autre']) });

// Report a post
export const POST = withErrorHandler(async (request) => {
  const userId = requireUser(request);                       // 401 LL_AUTH_401
  const { reason } = await parseBody(request, reportSchema); // 422 LL_VALIDATION_422 par champ
  if (alreadyReported) throw new AppError('LL_REPORT_409');  // code du catalogue
  return Response.json({ report }, { status: 201 });
});
```

- Chaque route est enveloppée par `withErrorHandler` : il ajoute `X-Trace-Id`, convertit les `AppError` et masque les exceptions.
- Les schémas Zod sont dans `backend/lib/schemas/`, un fichier par ressource, avec des messages en français.
- Ne jamais renvoyer `Response.json({ error })` à la main.

## Ajouter un code

1. L'ajouter dans `ERRORS` de `backend/lib/errors.js` : préfixe `LL_`, ressource ou règle, suffixe = statut HTTP (`LL_REPORT_403`), avec `status`, `title` et `when`.
2. Lancer `npm run docs` : le tableau ci-dessus est mis à jour.
3. Le documenter dans les réponses de la route : paramètre `codes` de `route()` dans le fichier de la ressource de `backend/lib/openapi/` (visible sur `/api/docs`).
4. Ajouter le cas dans `backend/tests/integration/openapi.test.js` : le test vérifie que l'API renvoie bien ce code et que Swagger le documente.

Choisir le statut selon la cause : `403` action interdite pour cet utilisateur, `404` ressource introuvable, `409` conflit avec l'état actuel (doublon, compte incomplet).
