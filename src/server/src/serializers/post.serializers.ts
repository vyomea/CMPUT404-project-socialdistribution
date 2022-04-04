import axios from 'axios';
import { Request } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { getHost } from '../utilities/host';
import { pick } from '../utilities/pick';
import { remoteRequestConfig } from '../utilities/remote-request-config';
import { serializeAuthor } from './author.serializers';
import { serializeComment } from './comment.serializers';

export const postPublicAttributes = [
  'id',
  'title',
  'source',
  'origin',
  'description',
  'contentType',
  'content',
  'categories',
  'count',
  'published',
  'visibility',
  'unlisted',
];

export const serializePost = async (
  post: Post,
  req: Request,
  comments?: Comment[]
): Promise<Record<string, unknown>> => {
  const serializeLocalPostData = async () => ({
    type: 'post',
    ...pick(post.toJSON(), postPublicAttributes),
    id: `${getHost(req)}/authors/${post.author.id}/posts/${post.id}`,
    url: `${getHost(req)}/authors/${post.author.id}/posts/${post.id}`,
    host: `${getHost(req)}/`,
    comments: `${getHost(req)}/authors/${post.author.id}/posts/${
      post.id
    }/comments`,
    author: await serializeAuthor(post.author, req),
    ...(comments && {
      commentsSrc: {
        type: 'comments',
        post: `${getHost(req)}/authors/${post.author.id}/posts/${post.id}`,
        id: `${getHost(req)}/authors/${post.author.id}/posts/${
          post.id
        }/comments`,
        page: 1,
        size: comments.length,
        comments: await Promise.all(
          comments.map((comment) => serializeComment(comment, req))
        ),
      },
    }),
  });

  if (!post.nodeServiceUrl) {
    return await serializeLocalPostData();
  } else {
    // Post is remote
    try {
      return (
        await axios.get(
          `/authors/${post.authorId}/posts/${post.id}`,
          remoteRequestConfig(await post.getNode())
        )
      ).data;
    } catch (e) {
      console.error(e);
      return await serializeLocalPostData();
    }
  }
};
