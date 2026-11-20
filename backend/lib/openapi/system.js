import { route, ok, z } from './registry';

route({
  method: 'get',
  path: '/api/health',
  tags: ['Système'],
  summary: "Vérifier que l'API répond",
  auth: false,
  responses: { 200: ok(z.object({ status: z.literal('ok') })) },
});

// The doc routes themselves
route({
  method: 'get',
  path: '/api/openapi.json',
  tags: ['Système'],
  summary: 'Ce document OpenAPI',
  auth: false,
  responses: { 200: ok(z.object({}).passthrough()) },
});

route({
  method: 'get',
  path: '/api/docs',
  tags: ['Système'],
  summary: 'Swagger UI',
  auth: false,
  responses: { 200: { description: 'Page HTML', content: { 'text/html': { schema: { type: 'string' } } } } },
});

route({
  method: 'get',
  path: '/api/docs/assets/{file}',
  tags: ['Système'],
  summary: 'Fichiers de Swagger UI',
  auth: false,
  request: { params: z.object({ file: z.enum(['swagger-ui.css', 'swagger-ui-bundle.js']) }) },
  responses: { 200: { description: 'Fichier CSS ou JavaScript' }, 404: { description: 'Fichier inconnu' } },
});
