import { profileSchema } from '../schemas';
import { OwnUser, User, body, id, idParam, ok, registry, route, z } from './registry';
import { Post } from './posts';

const Stats = registry.register(
  'UserStats',
  z.object({
    userId: id,
    posts: z.number().int(),
    likesReceived: z.number().int(),
    commentsReceived: z.number().int(),
    currentStreak: z.number().int().openapi({ description: 'Jours consécutifs avec une publication' }),
  })
);

registry.register('ProfileBody', profileSchema);

route({
  method: 'get',
  path: '/api/users',
  tags: ['Utilisateurs'],
  summary: 'Rechercher des utilisateurs par nom',
  request: { query: z.object({ search: z.string().optional().openapi({ example: 'Chloé' }) }) },
  responses: { 200: ok(z.object({ users: z.array(User) })) },
});

route({
  method: 'put',
  path: '/api/users/me',
  tags: ['Utilisateurs'],
  summary: 'Modifier mon profil (dont mon quartier)',
  request: body(profileSchema),
  responses: { 200: ok(z.object({ user: OwnUser })) },
  codes: ['LL_VALIDATION_422', 'LL_ZONE_404'],
});

route({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Utilisateurs'],
  summary: "Profil d'un utilisateur et ses publications",
  request: idParam("Identifiant de l'utilisateur"),
  responses: { 200: ok(z.object({ user: User, posts: z.array(Post), isMe: z.boolean() })) },
  codes: ['LL_USER_404'],
});

route({
  method: 'get',
  path: '/api/users/{id}/stats',
  tags: ['Utilisateurs'],
  summary: "Statistiques d'un utilisateur",
  request: idParam("Identifiant de l'utilisateur"),
  responses: { 200: ok(Stats) },
  codes: ['LL_USER_404'],
});
