// OpenAPI document of the API, served by /api/openapi.json and shown by Swagger UI on /api/docs.
// Request bodies reuse the Zod schemas of lib/schemas: the doc cannot drift from the validation.
// One file per resource, so that two features in parallel do not edit the same file.
// The import order is the order of the tags in Swagger. A test checks that every route of app/api is documented.
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';
import './system';
import './auth';
import './zones';
import './posts';
import './reports';
import './events';
import './users';

export function buildOpenApiDocument() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'API LocalLoop',
      version: '0.1.0',
      description:
        'API du réseau social de proximité LocalLoop. Les erreurs suivent le format `application/problem+json` décrit dans ERRORS.md.',
    },
    servers: [{ url: '/' }],
  });
}
