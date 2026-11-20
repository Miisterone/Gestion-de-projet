import { beforeEach, describe, expect, it } from 'vitest';
import { GET as list, POST as create } from '@/app/api/events/route';
import { prisma } from '@/lib/prisma';
import { createUser, request, resetDb } from '../helpers';

beforeEach(resetDb);

const DAY = 24 * 60 * 60 * 1000;
const inDays = (days) => new Date(Date.now() + days * DAY).toISOString();

const fete = (overrides = {}) => ({
  title: 'Fête des voisins',
  description: 'Chacun apporte un plat.',
  place: 'Place du Salin',
  startsAt: inDays(7),
  ...overrides,
});

function createEvent(token, overrides) {
  return create(request('/api/events', { method: 'POST', token, body: fete(overrides) }));
}

async function listEvents(token, query = '') {
  return (await list(request(`/api/events${query}`, { token }))).json();
}

async function zoneId(name) {
  return (await prisma.zone.findFirst({ where: { name } })).id;
}

describe('events', () => {
  it('creates an event in the neighbourhood of its author', async () => {
    const { token, user } = await createUser('Karim');

    const res = await createEvent(token);
    const { event } = await res.json();

    expect(res.status).toBe(201);
    expect(event).toMatchObject({
      title: 'Fête des voisins',
      description: 'Chacun apporte un plat.',
      place: 'Place du Salin',
      authorId: user.id,
      zoneId: user.zoneId,
      zone: { name: 'Saint-Michel', city: 'Toulouse' },
    });
    expect(event.author.firstName).toBe('Karim');
    expect(event.author.password).toBeUndefined();
  });

  it('ignores a zone sent by the client', async () => {
    const { token, user } = await createUser();
    const other = await zoneId('Les Carmes');

    const { event } = await (await createEvent(token, { zoneId: other })).json();

    expect(event.zoneId).toBe(user.zoneId);
  });

  it('requires to be logged in', async () => {
    const created = await create(request('/api/events', { method: 'POST', body: fete() }));
    const listed = await list(request('/api/events'));

    expect(created.status).toBe(401);
    expect(listed.status).toBe(401);
  });

  it('refuses an event without title, description, place or date', async () => {
    const { token } = await createUser();

    const res = await create(request('/api/events', { method: 'POST', token, body: { title: '  ' } }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.errors).toEqual([
      { field: 'title', code: 'REQUIRED', message: 'Le titre est vide.' },
      { field: 'description', code: 'REQUIRED', message: 'La description est obligatoire.' },
      { field: 'place', code: 'REQUIRED', message: 'Le lieu est obligatoire.' },
      { field: 'startsAt', code: 'REQUIRED', message: 'La date est obligatoire.' },
    ]);
  });

  it('refuses a date in the past or unreadable', async () => {
    const { token } = await createUser();

    const past = await (await createEvent(token, { startsAt: inDays(-1) })).json();
    const unreadable = await (await createEvent(token, { startsAt: 'samedi' })).json();

    expect(past.errors).toEqual([
      { field: 'startsAt', code: 'INVALID_VALUE', message: 'La date doit être dans le futur.' },
    ]);
    expect(unreadable.errors).toEqual([
      { field: 'startsAt', code: 'INVALID_FORMAT', message: "La date n'est pas valide." },
    ]);
  });

  it('shows an event to the neighbours of the same zone only', async () => {
    const author = await createUser('Karim');
    const neighbour = await createUser('Gérard');
    const elsewhere = await createUser('Chloé', await zoneId('Saint-Cyprien'));
    const { event } = await (await createEvent(author.token)).json();

    const sameZone = await listEvents(neighbour.token);
    const otherZone = await listEvents(elsewhere.token);

    expect(sameZone.events.map((e) => e.id)).toEqual([event.id]);
    expect(otherZone).toEqual({ events: [], hasMore: false });
  });

  it('lists the upcoming events from the nearest date, without the past ones', async () => {
    const { token, user } = await createUser();
    await createEvent(token, { title: 'Dans un mois', startsAt: inDays(30) });
    await createEvent(token, { title: 'Demain', startsAt: inDays(1) });
    await prisma.event.create({
      data: { ...fete({ title: 'Hier' }), startsAt: new Date(Date.now() - DAY), authorId: user.id, zoneId: user.zoneId },
    });

    const { events } = await listEvents(token);

    expect(events.map((e) => e.title)).toEqual(['Demain', 'Dans un mois']);
  });

  it('paginates the events by 10', async () => {
    const { token } = await createUser();
    for (let i = 0; i < 11; i += 1) await createEvent(token, { title: `Événement ${i}`, startsAt: inDays(i + 1) });

    const page1 = await listEvents(token, '?page=1');
    const page2 = await listEvents(token, '?page=2');

    expect(page1.events).toHaveLength(10);
    expect(page1.hasMore).toBe(true);
    expect(page2.events.map((e) => e.title)).toEqual(['Événement 10']);
    expect(page2.hasMore).toBe(false);
  });

  it('handles an account without neighbourhood: empty list, 409 LL_PROFILE_ZONE_409 on creation', async () => {
    const { token, user } = await createUser();
    await prisma.user.update({ where: { id: user.id }, data: { zoneId: null } });

    const listed = await listEvents(token);
    const created = await createEvent(token);

    expect(listed).toEqual({ events: [], hasMore: false });
    expect(created.status).toBe(409);
    expect((await created.json()).code).toBe('LL_PROFILE_ZONE_409');
  });
});
