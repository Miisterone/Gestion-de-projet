import { eventSchema } from '../schemas';
import { User, Zone, body, date, id, ok, pageQuery, registry, route, z } from './registry';

const Event = registry.register(
  'Event',
  z.object({
    id,
    authorId: id,
    zoneId: z.number().int().openapi({ description: "Quartier de l'auteur à la création" }),
    title: z.string(),
    description: z.string(),
    place: z.string().openapi({ description: 'Lieu de rendez-vous en texte libre, jamais une adresse personnelle' }),
    startsAt: date,
    createdAt: date,
    author: User,
    zone: Zone,
  })
);

registry.register('EventBody', eventSchema);

route({
  method: 'get',
  path: '/api/events',
  tags: ['Événements'],
  summary: 'Événements à venir de mon quartier, 10 par page',
  request: pageQuery,
  responses: { 200: ok(z.object({ events: z.array(Event), hasMore: z.boolean() })) },
});

route({
  method: 'post',
  path: '/api/events',
  tags: ['Événements'],
  summary: 'Créer un événement dans mon quartier',
  request: body(eventSchema),
  responses: { 201: ok(z.object({ event: Event }), 'Événement créé') },
  codes: ['LL_VALIDATION_422', 'LL_ZONE_404'],
});
