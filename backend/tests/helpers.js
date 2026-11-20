// Helpers for the integration tests: they call the route handlers directly, without HTTP server
import { prisma } from '@/lib/prisma';
import { POST as register } from '@/app/api/auth/register/route';

// Empties every table between two tests
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'truncate table reports, events, likes, comments, posts, users restart identity cascade'
  );
}

// Builds a Request as Next.js gives it to a route handler
export function request(path, { method = 'GET', body, token } = {}) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let counter = 0;

// Id of the first pilot zone (inserted by the migrations)
export async function firstZoneId() {
  const zone = await prisma.zone.findFirst({ orderBy: { id: 'asc' } });
  return zone.id;
}

// Creates an account (in the first pilot zone by default) and returns { token, user }
export async function createUser(firstName = 'Test', zoneId) {
  counter += 1;
  const res = await register(
    request('/api/auth/register', {
      method: 'POST',
      body: { firstName, lastName: 'User', email: `user${counter}@test.dev`, password: 'secret1', zoneId: zoneId ?? (await firstZoneId()) },
    })
  );
  return res.json();
}
