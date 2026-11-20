import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import { getSecret } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GET as me } from '@/app/api/auth/me/route';
import { GET as feed, POST as publish } from '@/app/api/posts/route';
import { GET as profile } from '@/app/api/users/[id]/route';
import { createUser, request, resetDb } from '../helpers';

beforeEach(resetDb);

describe('JWT secret', () => {
  it('refuses a missing or default secret in production', () => {
    for (const JWT_SECRET of [undefined, 'change-me', 'dev-secret', 'too-short']) {
      expect(() => getSecret({ NODE_ENV: 'production', JWT_SECRET })).toThrow(/JWT_SECRET/);
    }
  });

  it('accepts a strong secret in production and a fallback in development', () => {
    expect(getSecret({ NODE_ENV: 'production', JWT_SECRET: 'x'.repeat(32) })).toBe('x'.repeat(32));
    expect(getSecret({ NODE_ENV: 'development' })).toBe('dev-secret');
  });
});

describe('invalid inputs never answer 500', () => {
  it('answers 401 to a token signed with another secret', async () => {
    const token = jwt.sign({ id: crypto.randomUUID() }, 'dev-secret');
    expect((await feed(request('/api/posts', { token }))).status).toBe(401);
  });

  it('answers 401 to a token whose id is not a UUID', async () => {
    const token = jwt.sign({ id: 'not-a-uuid' }, process.env.JWT_SECRET);
    expect((await feed(request('/api/posts', { token }))).status).toBe(401);
  });

  it('answers 401 when the account of the token was deleted', async () => {
    const { token, user } = await createUser();
    await prisma.user.delete({ where: { id: user.id } });

    const res = await publish(request('/api/posts', { method: 'POST', token, body: { content: 'Hello' } }));
    expect(res.status).toBe(401);
  });

  it('answers 422 to a body that is not an object', async () => {
    const { token } = await createUser();
    const res = await publish(request('/api/posts', { method: 'POST', token, body: ['x'] }));
    expect(res.status).toBe(422);
  });
});

describe('email of the users (LL-232)', () => {
  it('is never sent to other users, only to the owner of the account', async () => {
    const author = await createUser('Author');
    const reader = await createUser('Reader');
    await publish(request('/api/posts', { method: 'POST', token: author.token, body: { content: 'Hello' } }));

    const { posts } = await (await feed(request('/api/posts', { token: reader.token }))).json();
    expect(posts[0].author).not.toHaveProperty('email');

    const res = await profile(request(`/api/users/${author.user.id}`, { token: reader.token }), {
      params: { id: author.user.id },
    });
    expect((await res.json()).user).not.toHaveProperty('email');

    const own = await (await me(request('/api/auth/me', { token: author.token }))).json();
    expect(own.user.email).toBe(author.user.email);
  });
});
