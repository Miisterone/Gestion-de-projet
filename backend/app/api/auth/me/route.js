import { findOwnUser, requireUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/handler';

// Get the logged user
export const GET = withErrorHandler(async (request) => {
  const user = await findOwnUser(requireUser(request));
  if (!user) throw new AppError('LL_AUTH_401');

  return Response.json({ user });
});
