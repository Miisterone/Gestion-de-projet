import { requireUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/handler';
import { requirePost } from '@/lib/posts';
import { isUniqueViolation, prisma } from '@/lib/prisma';
import { reportSchema } from '@/lib/schemas';
import { parseBody } from '@/lib/validation';

// Report the post of a neighbour, once per post
export const POST = withErrorHandler(async (request) => {
  const userId = requireUser(request);
  const { postId, reason } = await parseBody(request, reportSchema);

  const post = await requirePost(postId);
  if (post.authorId === userId) throw new AppError('LL_REPORT_403');

  let report;
  try {
    report = await prisma.report.create({
      data: { postId, reporterId: userId, reason },
      select: { id: true, postId: true, reason: true, createdAt: true },
    });
  } catch (error) {
    // Unique (post_id, reporter_id): also covers two clicks sent at the same time
    if (isUniqueViolation(error)) throw new AppError('LL_REPORT_409');
    throw error;
  }

  return Response.json({ report }, { status: 201 });
});
