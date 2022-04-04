import { Request } from 'express';
import Comment from '../models/Comment';
import { getHost } from '../utilities/host';
import { pick } from '../utilities/pick';
import { serializeAuthor } from './author.serializers';

export const serializeComment = async (comment: Comment, req: Request) => ({
  type: 'comment',
  ...pick(comment.toJSON(), ['comment', 'contentType', 'published']),
  author: await serializeAuthor(comment.author, req),
  id: `${getHost(req)}/authors/${comment.post.author.id}/posts/${
    comment.post.id
  }/comments/${comment.id}`,
});
