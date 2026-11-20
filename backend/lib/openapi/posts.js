import { commentSchema, postSchema } from '../schemas';
import { Message, User, body, date, id, idParam, ok, pageQuery, registry, route, z } from './registry';

export const Post = registry.register(
  'Post',
  z.object({
    id,
    authorId: id,
    content: z.string(),
    createdAt: date,
    author: User,
    likesCount: z.number().int(),
    likedByMe: z.boolean(),
    commentsCount: z.number().int(),
  })
);

const Comment = registry.register(
  'Comment',
  z.object({ id, postId: id, authorId: id, content: z.string(), createdAt: date, author: User })
);

registry.register('PostBody', postSchema);
registry.register('CommentBody', commentSchema);

route({
  method: 'get',
  path: '/api/posts',
  tags: ['Publications'],
  summary: "Fil d'actualité, 10 publications par page",
  request: pageQuery,
  responses: { 200: ok(z.object({ posts: z.array(Post), hasMore: z.boolean() })) },
});

route({
  method: 'post',
  path: '/api/posts',
  tags: ['Publications'],
  summary: 'Publier',
  request: body(postSchema),
  responses: { 201: ok(z.object({ post: Post }), 'Publication créée') },
  codes: ['LL_VALIDATION_422'],
});

route({
  method: 'delete',
  path: '/api/posts/{id}',
  tags: ['Publications'],
  summary: 'Supprimer une de mes publications',
  request: idParam('Identifiant de la publication'),
  responses: { 200: ok(Message) },
  codes: ['LL_AUTH_403', 'LL_POST_404'],
});

route({
  method: 'post',
  path: '/api/posts/{id}/like',
  tags: ['Publications'],
  summary: "Aimer ou ne plus aimer une publication",
  request: idParam('Identifiant de la publication'),
  responses: { 200: ok(z.object({ liked: z.boolean(), likesCount: z.number().int() })) },
  codes: ['LL_POST_404'],
});

route({
  method: 'get',
  path: '/api/posts/{id}/comments',
  tags: ['Publications'],
  summary: "Commentaires d'une publication",
  request: idParam('Identifiant de la publication'),
  responses: { 200: ok(z.object({ comments: z.array(Comment) })) },
  codes: ['LL_POST_404'],
});

route({
  method: 'post',
  path: '/api/posts/{id}/comments',
  tags: ['Publications'],
  summary: 'Commenter une publication',
  request: { ...idParam('Identifiant de la publication'), ...body(commentSchema) },
  responses: { 201: ok(z.object({ comment: Comment }), 'Commentaire créé') },
  codes: ['LL_VALIDATION_422', 'LL_POST_404'],
});
