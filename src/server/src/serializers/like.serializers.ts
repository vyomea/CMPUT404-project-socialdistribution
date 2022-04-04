import { Request } from 'express';
import CommentLike from '../models/CommentLike';
import PostLike from '../models/PostLike';
import { getHost } from '../utilities/host';
import { serializeAuthor } from './author.serializers';

export const serializeLike = async (
  like: CommentLike | PostLike,
  req: Request
): Promise<Record<string, unknown>> => {
  let objectUrl: string;
  if (like instanceof CommentLike)
    objectUrl = `${getHost(req)}/authors/${like.comment.post.authorId}/posts/${
      like.comment.postId
    }/comments/${like.commentId}`;
  else if (like instanceof PostLike)
    objectUrl = `${getHost(req)}/authors/${like.post.authorId}/posts/${
      like.postId
    }`;
  else throw new Error('Unknown like type');
  return {
    type: 'Like',
    author: await serializeAuthor(like.author, req),
    object: objectUrl,
  };
};
