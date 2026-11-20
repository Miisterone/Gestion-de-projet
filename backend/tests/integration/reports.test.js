import { beforeEach, describe, expect, it } from 'vitest';
import { POST as publish } from '@/app/api/posts/route';
import { POST as report } from '@/app/api/reports/route';
import { prisma } from '@/lib/prisma';
import { createUser, request, resetDb } from '../helpers';

beforeEach(resetDb);

const UNKNOWN = '00000000-0000-4000-8000-000000000000';

async function createPost(token) {
  const res = await publish(request('/api/posts', { method: 'POST', token, body: { content: 'Bonjour le quartier' } }));
  return (await res.json()).post;
}

function send(token, body) {
  return report(request('/api/reports', { method: 'POST', token, body }));
}

describe('reports', () => {
  let author;
  let neighbour;
  let post;

  beforeEach(async () => {
    author = await createUser('Karim');
    neighbour = await createUser('Chloé');
    post = await createPost(author.token);
  });

  it('saves the report of a neighbour', async () => {
    const res = await send(neighbour.token, { postId: post.id, reason: 'inapproprie' });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.report).toMatchObject({ postId: post.id, reason: 'inapproprie' });
    expect(await prisma.report.findFirst()).toMatchObject({ reporterId: neighbour.user.id, reason: 'inapproprie' });
  });

  it('requires to be logged in', async () => {
    const res = await report(request('/api/reports', { method: 'POST', body: { postId: post.id, reason: 'abus' } }));

    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('LL_AUTH_401');
  });

  it('refuses a second report of the same post by the same user', async () => {
    await send(neighbour.token, { postId: post.id, reason: 'abus' });
    const res = await send(neighbour.token, { postId: post.id, reason: 'autre' });

    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('LL_REPORT_409');
    expect(await prisma.report.count()).toBe(1);
  });

  it('accepts the reports of several users on the same post', async () => {
    const other = await createUser('Inès');

    const first = await send(neighbour.token, { postId: post.id, reason: 'abus' });
    const second = await send(other.token, { postId: post.id, reason: 'abus' });

    expect([first.status, second.status]).toEqual([201, 201]);
  });

  it('refuses to report my own post', async () => {
    const res = await send(author.token, { postId: post.id, reason: 'abus' });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toMatchObject({ code: 'LL_REPORT_403', detail: 'Vous ne pouvez pas signaler votre propre publication.' });
  });

  it('answers 404 for an unknown post', async () => {
    const res = await send(neighbour.token, { postId: UNKNOWN, reason: 'abus' });

    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe('LL_POST_404');
  });

  it('requires a valid post id and a known reason', async () => {
    const res = await send(neighbour.token, { postId: 'abc', reason: 'spam' });
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.errors).toEqual([
      { field: 'postId', code: 'INVALID_ID', message: 'La publication est invalide.' },
      { field: 'reason', code: 'INVALID_VALUE', message: 'Choisissez un motif de signalement.' },
    ]);
  });

  it('requires a reason', async () => {
    const res = await send(neighbour.token, { postId: post.id });

    expect(res.status).toBe(422);
    expect((await res.json()).errors).toEqual([
      { field: 'reason', code: 'REQUIRED', message: 'Choisissez un motif de signalement.' },
    ]);
  });

  it('deletes the reports with their post', async () => {
    await send(neighbour.token, { postId: post.id, reason: 'abus' });

    await prisma.post.delete({ where: { id: post.id } });

    expect(await prisma.report.count()).toBe(0);
  });
});
