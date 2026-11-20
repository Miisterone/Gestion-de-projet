import bcrypt from 'bcryptjs';
import { createToken, findOwnUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/handler';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas';
import { parseBody } from '@/lib/validation';

// Log in and get a token
export const POST = withErrorHandler(async (request) => {
  const { email, password } = await parseBody(request, loginSchema);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('LL_LOGIN_401');
  }

  return Response.json({ token: createToken(user), user: await findOwnUser(user.id) });
});
