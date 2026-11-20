import { beforeEach, describe, expect, it } from 'vitest';
import { GET as listZones } from '@/app/api/zones/route';
import { POST as register } from '@/app/api/auth/register/route';
import { GET as profile } from '@/app/api/users/[id]/route';
import { PUT as editProfile } from '@/app/api/users/me/route';
import { prisma } from '@/lib/prisma';
import { createUser, request, resetDb } from '../helpers';

beforeEach(resetDb);

const account = (zoneId) => ({
  firstName: 'Karim',
  lastName: 'Haddad',
  email: `karim-${Math.random()}@test.dev`,
  password: 'secret1',
  zoneId,
});

describe('zones', () => {
  it('lists the pilot zone without being logged in', async () => {
    const res = await listZones(request('/api/zones'));
    const { zones } = await res.json();

    expect(res.status).toBe(200);
    expect(zones.map((z) => z.name)).toEqual(
      expect.arrayContaining(['Saint-Michel', 'Saint-Cyprien', 'Les Carmes'])
    );
    expect(zones.every((z) => z.city === 'Toulouse')).toBe(true);
  });

  it('attaches the chosen zone to the new account', async () => {
    const { zones } = await (await listZones(request('/api/zones'))).json();
    const carmes = zones.find((z) => z.name === 'Les Carmes');

    const res = await register(request('/api/auth/register', { method: 'POST', body: account(carmes.id) }));
    const { user } = await res.json();

    expect(res.status).toBe(201);
    expect(user).toMatchObject({ zoneId: carmes.id, zone: carmes });
  });

  it('answers 404 LL_ZONE_404 for an unknown zone', async () => {
    const res = await register(request('/api/auth/register', { method: 'POST', body: account(9999) }));

    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe('LL_ZONE_404');
  });

  it('requires a zone', async () => {
    const { zoneId, ...withoutZone } = account(1);
    const res = await register(request('/api/auth/register', { method: 'POST', body: withoutZone }));

    expect(res.status).toBe(422);
    expect((await res.json()).errors).toEqual([
      { field: 'zoneId', code: 'REQUIRED', message: 'Choisissez votre quartier.' },
    ]);
  });

  it('shows the neighbourhood on a profile, never an address', async () => {
    const me = await createUser('Me');
    const other = await createUser('Other');

    const { user } = await (
      await profile(request(`/api/users/${other.user.id}`, { token: me.token }), { params: { id: other.user.id } })
    ).json();

    expect(user.zone).toMatchObject({ name: 'Saint-Michel', city: 'Toulouse' });
    expect(Object.keys(user)).not.toContain('address');
    expect(Object.keys(user)).not.toContain('password');
  });

  it('lets an account without neighbourhood choose one in its profile', async () => {
    const { token, user } = await createUser('Old');
    await prisma.user.update({ where: { id: user.id }, data: { zoneId: null } });
    const { zones } = await (await listZones(request('/api/zones'))).json();

    const res = await editProfile(request('/api/users/me', { method: 'PUT', token, body: { zoneId: zones[0].id } }));

    expect(res.status).toBe(200);
    expect((await res.json()).user).toMatchObject({ zoneId: zones[0].id, zone: { name: zones[0].name } });
  });

  it('refuses an unknown neighbourhood in the profile', async () => {
    const { token } = await createUser('Me');

    const res = await editProfile(request('/api/users/me', { method: 'PUT', token, body: { zoneId: 999999 } }));

    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe('LL_ZONE_404');
  });
});
