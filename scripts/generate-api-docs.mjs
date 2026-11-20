// Generates docs/API.md from the API routes of the backend,
// and the catalogue of ERRORS.md from backend/lib/errors.js
import fs from 'fs';
import path from 'path';
import { ERRORS, FRONT_ERRORS } from '../backend/lib/errors.js';

const API_DIR = 'backend/app/api';
const OUTPUT = 'docs/API.md';

function findRoutes(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(findRoutes(fullPath));
    else if (entry.name === 'route.js') files.push(fullPath);
  }
  return files;
}

const rows = [];

for (const file of findRoutes(API_DIR).sort()) {
  const code = fs.readFileSync(file, 'utf-8');
  const url = '/api/' + path.relative(API_DIR, path.dirname(file)).split(path.sep).join('/');
  const needsAuth = code.includes('requireUser(') ? 'Oui' : 'Non';

  // Finds "// comment" (optional) followed by "export const GET = withErrorHandler("
  // \r?\n: in case a route file still has CRLF line endings (see .gitattributes)
  const regex = /(?:\/\/ (.*)\r?\n)?export const (GET|POST|PUT|DELETE) = /g;
  for (const match of code.matchAll(regex)) {
    rows.push(`| ${match[2]} | \`${url}\` | ${needsAuth} | ${match[1] || ''} |`);
  }
}

const content = `# Documentation de l'API

> Fichier généré automatiquement par \`npm run docs\`, ne pas modifier à la main.

Les routes protégées attendent le header \`Authorization: Bearer <token>\`.
Les erreurs suivent le format \`application/problem+json\` décrit dans [ERRORS.md](../ERRORS.md).

| Méthode | Route | Connexion | Description |
|---|---|:-:|---|
${rows.join('\n')}
`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, content);
console.log(`${OUTPUT} : ${rows.length} routes`);

// ---------- Catalogue of ERRORS.md, between the two markers ----------

const ERRORS_FILE = 'ERRORS.md';
const START = '<!-- catalogue:start (généré par npm run docs, ne pas modifier à la main) -->';
const END = '<!-- catalogue:end -->';

const errorRows = [
  ...Object.entries(ERRORS).map(([code, { status, title, when }]) => `| \`${code}\` | ${status} | ${title} | ${when} |`),
  ...Object.entries(FRONT_ERRORS).map(([code, { title, when }]) => `| \`${code}\` | - | ${title} | ${when} |`),
];

const catalogue = `${START}
| Code | HTTP | Message affiché | Quand |
|---|:-:|---|---|
${errorRows.join('\n')}
${END}`;

const errorsDoc = fs.readFileSync(ERRORS_FILE, 'utf-8');
const start = errorsDoc.indexOf(START);
const end = errorsDoc.indexOf(END);
if (start === -1 || end === -1) throw new Error(`${ERRORS_FILE}: markers of the catalogue not found`);

fs.writeFileSync(ERRORS_FILE, errorsDoc.slice(0, start) + catalogue + errorsDoc.slice(end + END.length));
console.log(`${ERRORS_FILE} : ${errorRows.length} codes`);
