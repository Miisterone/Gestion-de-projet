// Writes the OpenAPI document to a file, for the static Swagger published by the CI.
// Run with vite-node (the lib files use extensionless imports): npm run openapi:export -w backend -- <file>
import fs from 'node:fs';
import path from 'node:path';
import { buildOpenApiDocument } from '../lib/openapi/index.js';

const output = process.argv[2] || 'openapi.json';
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, JSON.stringify(buildOpenApiDocument(), null, 2));
console.log(`OpenAPI written to ${output}`);
