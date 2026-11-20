# Documentation de l'API

> Fichier généré automatiquement par `npm run docs`, ne pas modifier à la main.

Les routes protégées attendent le header `Authorization: Bearer <token>`.
Les erreurs suivent le format `application/problem+json` décrit dans [ERRORS.md](../ERRORS.md).

| Méthode | Route | Connexion | Description |
|---|---|:-:|---|
| POST | `/api/auth/login` | Non | Log in and get a token |
| GET | `/api/auth/me` | Oui | Get the logged user |
| POST | `/api/auth/register` | Non | Create an account |
| GET | `/api/docs/assets/[file]` | Non | Files of Swagger UI, served by the API so the doc works without internet access |
| GET | `/api/docs` | Non | Swagger UI |
| GET | `/api/events` | Oui | Upcoming events of my neighbourhood, 10 per page (?page=1) |
| POST | `/api/events` | Oui | Create an event in my neighbourhood |
| GET | `/api/health` | Non | Check that the API is running |
| GET | `/api/openapi.json` | Non | OpenAPI document of the API |
| GET | `/api/posts/[id]/comments` | Oui | Comments of a post |
| POST | `/api/posts/[id]/comments` | Oui | Comment a post |
| POST | `/api/posts/[id]/like` | Oui | Like or unlike a post |
| DELETE | `/api/posts/[id]` | Oui | Delete one of my posts |
| GET | `/api/posts` | Oui | Feed, 10 posts per page (?page=1) |
| POST | `/api/posts` | Oui | Publish a post |
| POST | `/api/reports` | Oui | Report the post of a neighbour, once per post |
| GET | `/api/users/[id]` | Oui | Profile of a user with their posts |
| GET | `/api/users/[id]/stats` | Oui | Statistics of a user: posts, likes and comments received, current streak |
| PUT | `/api/users/me` | Oui | Edit my profile |
| GET | `/api/users` | Oui | Search users by name |
| GET | `/api/zones` | Non | Neighbourhoods that can be chosen at registration (public: needed before having an account) |
