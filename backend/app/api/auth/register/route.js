import bcrypt from 'bcryptjs';
import { createToken, ownUserSelect } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/handler';
import { isUniqueViolation, prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/schemas';
import { parseBody } from '@/lib/validation';
import { requireZone } from '@/lib/zones';

// Create an account
export const POST = withErrorHandler(async (request) => {
  const { firstName, lastName, email, password, zoneId } = await parseBody(request, registerSchema);

  await requireZone(zoneId);

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw new AppError('LL_EMAIL_409');
  }

  try {
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: await bcrypt.hash(password, 10), zoneId },
      select: ownUserSelect,
    });
    return Response.json({ token: createToken(user), user }, { status: 201 });
  } catch (error) {
    // Two registrations with the same email at the same time
    if (isUniqueViolation(error)) throw new AppError('LL_EMAIL_409');
    throw error;
  }
});
