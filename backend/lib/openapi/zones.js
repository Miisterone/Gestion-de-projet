import { Zone, ok, route, z } from './registry';

route({
  method: 'get',
  path: '/api/zones',
  tags: ['Quartiers'],
  summary: "Quartiers que l'on peut choisir à l'inscription",
  auth: false,
  responses: { 200: ok(z.object({ zones: z.array(Zone) })) },
});
