// Shared parts of the OpenAPI document: registry, common schemas and the route() helper.
// Each resource registers its schemas and routes in its own file (posts.js, events.js...).
import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { ERRORS, ERROR_TYPE_BASE } from '../errors';

extendZodWithOpenApi(z);

export { z };

export const registry = new OpenAPIRegistry();

const bearer = registry.registerComponent('securitySchemes', 'bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ---------- Common schemas ----------

export const id = z.string().uuid();
export const date = z.string().datetime();

export const Zone = registry.register(
  'Zone',
  z
    .object({ id: z.number().int(), name: z.string(), city: z.string() })
    .openapi({ example: { id: 1, name: 'Saint-Michel', city: 'Toulouse' } })
);

export const User = registry.register(
  'User',
  z.object({
    id,
    firstName: z.string(),
    lastName: z.string(),
    bio: z.string(),
    avatar: z.string(),
    zoneId: z.number().int().nullable().openapi({ description: 'Quartier choisi (null pour les anciens comptes)' }),
    zone: Zone.nullable(),
    createdAt: date,
  })
);

// The logged user's own account: the public profile and the email
export const OwnUser = registry.register('OwnUser', User.extend({ email: z.string().email() }));

export const Message = z.object({ message: z.string() });

const Problem = registry.register(
  'Problem',
  z
    .object({
      type: z.string().url().openapi({ example: `${ERROR_TYPE_BASE}LL_POST_404` }),
      title: z.string().openapi({ example: ERRORS.LL_POST_404.title }),
      status: z.number().int().openapi({ example: 404 }),
      code: z.enum(Object.keys(ERRORS)),
      detail: z.string(),
      instance: z.string().openapi({ example: '/api/posts/42' }),
      traceId: z.string().uuid(),
      errors: z
        .array(z.object({ field: z.string(), code: z.string(), message: z.string() }))
        .optional()
        .openapi({ description: 'Erreurs 422 uniquement, une entrée par champ' }),
    })
    .openapi({ description: 'Erreur au format RFC 7807, voir ERRORS.md' })
);

// ---------- Helpers ----------

const traceHeader = {
  'X-Trace-Id': { description: 'Identifiant de la requête, présent dans les logs serveur', schema: { type: 'string' } },
};

export function ok(schema, description = 'Succès') {
  return { description, headers: traceHeader, content: { 'application/json': { schema } } };
}

// Error responses: one entry per HTTP status, listing the possible codes
function errors(...codes) {
  const byStatus = {};
  for (const code of codes) {
    const { status, title } = ERRORS[code];
    (byStatus[status] ||= []).push(`\`${code}\` : ${title}`);
  }
  return Object.fromEntries(
    Object.entries(byStatus).map(([status, lines]) => [
      status,
      { description: lines.join('<br>'), headers: traceHeader, content: { 'application/problem+json': { schema: Problem } } },
    ])
  );
}

export const body = (schema) => ({ body: { required: true, content: { 'application/json': { schema } } } });
export const idParam = (description) => ({ params: z.object({ id: id.openapi({ description }) }) });
export const pageQuery = { query: z.object({ page: z.number().int().min(1).optional().openapi({ example: 1 }) }) };

// Every protected route can answer 401, and every route 500
const AUTH = ['LL_AUTH_401'];
const ALWAYS = ['LL_INTERNAL_500'];

// codes: the possible errors of the route, from the catalogue of lib/errors.js
export function route({ method, path, tags, summary, auth = true, request, responses, codes = [] }) {
  registry.registerPath({
    method,
    path,
    tags,
    summary,
    ...(auth && { security: [{ [bearer.name]: [] }] }),
    request,
    responses: { ...responses, ...errors(...(auth ? AUTH : []), ...codes, ...ALWAYS) },
  });
}
