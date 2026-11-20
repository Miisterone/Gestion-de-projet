import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument } from '.';

const API_DIR = path.join(__dirname, '..', '..', 'app', 'api');

// Every "export const GET = ..." of app/api, as "get /api/posts/{id}"
function routesInCode(dir = API_DIR) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return routesInCode(full);
    if (entry.name !== 'route.js') return [];

    const url =
      '/api/' +
      path
        .relative(API_DIR, path.dirname(full))
        .split(path.sep)
        .map((part) => part.replace(/^\[(.+)\]$/, '{$1}'))
        .join('/');
    const code = fs.readFileSync(full, 'utf-8');
    return [...code.matchAll(/export const (GET|POST|PUT|DELETE) = /g)].map((m) => `${m[1].toLowerCase()} ${url}`);
  });
}

describe('OpenAPI document', () => {
  const document = buildOpenApiDocument();
  const documented = Object.entries(document.paths).flatMap(([url, methods]) =>
    Object.keys(methods).map((method) => `${method} ${url}`)
  );

  it('documents every route of app/api, and only them', () => {
    expect(documented.sort()).toEqual(routesInCode().sort());
  });

  it('documents a problem+json 500 on every route', () => {
    for (const methods of Object.values(document.paths)) {
      for (const operation of Object.values(methods)) {
        expect(operation.responses['500'].content).toHaveProperty('application/problem+json');
      }
    }
  });

  it('documents the 422 of the routes that read a body', () => {
    for (const methods of Object.values(document.paths)) {
      for (const operation of Object.values(methods)) {
        if (operation.requestBody) expect(operation.responses).toHaveProperty('422');
      }
    }
  });
});
