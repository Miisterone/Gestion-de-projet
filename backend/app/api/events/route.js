import { requireUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { createEvent, listEvents } from '@/lib/events';
import { withErrorHandler } from '@/lib/handler';
import { eventSchema } from '@/lib/schemas';
import { parseBody } from '@/lib/validation';
import { findUserZoneId } from '@/lib/zones';

const PAGE_SIZE = 10;

// Upcoming events of my neighbourhood, 10 per page (?page=1)
export const GET = withErrorHandler(async (request) => {
  const userId = requireUser(request);
  const zoneId = await findUserZoneId(userId);

  // An account without neighbourhood sees no event
  if (!zoneId) return Response.json({ events: [], hasMore: false });

  const page = Math.max(1, Math.floor(Number(new URL(request.url).searchParams.get('page'))) || 1);

  // One more event than needed tells if there is a next page
  const list = await listEvents({ zoneId, take: PAGE_SIZE + 1, skip: (page - 1) * PAGE_SIZE });

  return Response.json({ events: list.slice(0, PAGE_SIZE), hasMore: list.length > PAGE_SIZE });
});

// Create an event in my neighbourhood
export const POST = withErrorHandler(async (request) => {
  const userId = requireUser(request);
  const { title, description, place, startsAt } = await parseBody(request, eventSchema);

  // The event belongs to the neighbourhood of its author: the client cannot choose another one
  const zoneId = await findUserZoneId(userId);
  // Not a missing resource but a state of the account: the front links to the profile
  if (!zoneId) throw new AppError('LL_PROFILE_ZONE_409');

  const event = await createEvent({ authorId: userId, zoneId, title, description, place, startsAt: new Date(startsAt) });

  return Response.json({ event }, { status: 201 });
});
