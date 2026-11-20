import { ownUserSelect, requireUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/handler';
import { isNotFound, prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/schemas';
import { parseBody } from '@/lib/validation';
import { requireZone } from '@/lib/zones';

// Edit my profile
export const PUT = withErrorHandler(async (request) => {
  const userId = requireUser(request);
  const data = await parseBody(request, profileSchema);
  if (data.zoneId !== undefined) await requireZone(data.zoneId);

  try {
    const user = await prisma.user.update({ where: { id: userId }, data, select: ownUserSelect });
    return Response.json({ user });
  } catch (error) {
    // Account deleted since the token was created
    if (isNotFound(error)) throw new AppError('LL_AUTH_401');
    throw error;
  }
});
