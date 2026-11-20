import jwt from 'jsonwebtoken';
import { AppError } from './errors';
import { isUuid } from './ids';
import { prisma } from './prisma';

// Values that must never sign tokens outside a developer machine
const WEAK_SECRETS = ['', 'change-me', 'dev-secret'];

// Secret read at first use: the build runs without it. In production a missing or
// default secret stops the server instead of signing tokens anyone can forge.
export function getSecret(env = process.env) {
  const secret = env.JWT_SECRET || '';
  if (env.NODE_ENV === 'production' && (WEAK_SECRETS.includes(secret) || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production');
  }
  return secret || 'dev-secret';
}

export function createToken(user) {
  return jwt.sign({ id: user.id }, getSecret(), { expiresIn: '7d' });
}

// Returns the id of the logged user, or null
export function getUserId(request) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;

  let payload;
  try {
    payload = jwt.verify(header.slice(7), getSecret(), { algorithms: ['HS256'] });
  } catch (error) {
    // A configuration error must stay a 500, only a bad token is a 401
    if (error instanceof jwt.JsonWebTokenError) return null;
    throw error;
  }
  // Ids are UUIDs: anything else would make the database queries fail
  return isUuid(payload?.id) ? payload.id : null;
}

// Id of the logged user, LL_AUTH_401 if the token is missing or invalid
export function requireUser(request) {
  const userId = getUserId(request);
  if (!userId) throw new AppError('LL_AUTH_401');
  return userId;
}

// Fields of a user that any logged user can see (never the password nor the email)
export const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  bio: true,
  avatar: true,
  // Only the neighbourhood is public, never an address
  zoneId: true,
  zone: { select: { id: true, name: true, city: true } },
  createdAt: true,
};

// Fields of their own account sent to the logged user: the public fields and the email
export const ownUserSelect = { ...publicUserSelect, email: true };

export function findOwnUser(id) {
  return prisma.user.findUnique({ where: { id }, select: ownUserSelect });
}

export function findPublicUser(id) {
  return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
}

// Public profile of an existing user, LL_USER_404 otherwise
export async function requirePublicUser(id) {
  const user = isUuid(id) ? await findPublicUser(id) : null;
  if (!user) throw new AppError('LL_USER_404');
  return user;
}
