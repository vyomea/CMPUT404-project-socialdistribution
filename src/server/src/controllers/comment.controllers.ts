import { Request, Response } from 'express';
import Author from '../models/Author';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { getHost } from '../utilities/host';

const createComment = async (req: AuthenticatedRequest, res: Response) => {
  const { comment, contentType } = req.body;
  const commentStr = comment;

  const post = await Post.findOne({
    where: {
      id: req.params.post_id,
    },
  });
  const author = await Author.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (post === null) {
    res.status(404).send();
    return;
  }
  try {
    const comment = await Comment.create({
      comment: commentStr,
      contentType: contentType,
    });
    post.addComment(comment);
    author.addComment(comment);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
    return;
  }

  res.status(200).send();
};

const getPostComment = async (req: Request, res: Response) => {
  const comment = await Comment.findOne({
    attributes: ['comment', 'contentType', 'published', 'id'],
    where: {
      post_id: req.params.post_id,
    },
    include: {
      model: Author,
      attributes: ['id', 'displayName', 'github', 'profileImage'],
      as: 'author',
    },
  });
  if (comment === null) {
    res.status(404).send();
    return;
  }
  res.send({
    type: 'comment',
    ...comment.toJSON(),
    author: {
      type: 'author',
      ...comment.toJSON().author,
      id:
        getHost(req) +
        req.baseUrl.substring(0, req.baseUrl.search('posts') - 1),
      url:
        getHost(req) +
        req.baseUrl.substring(0, req.baseUrl.search('posts') - 1),
      host: getHost(req) + '/',
    },
    id: getHost(req) + req.baseUrl + '/' + comment.toJSON().id,
  });
};

const getPostComments = async (req: PaginationRequest, res: Response) => {
  const comments = await Comment.findAll({
    attributes: ['comment', 'contentType', 'published', 'id'],
    where: {
      post_id: req.params.post_id,
    },
    include: {
      model: Author,
      attributes: ['id', 'displayName', 'github', 'profileImage'],
      as: 'author',
    },
    offset: req.offset,
    limit: req.limit,
  });
  res.send({
    type: 'comments',
    comments: comments.map((comment) => {
      return {
        type: 'comment',
        ...comment.toJSON(),
        author: {
          type: 'author',
          ...comment.toJSON().author,
          id:
            getHost(req) +
            req.baseUrl.substring(0, req.baseUrl.search('posts') - 1),
          url:
            getHost(req) +
            req.baseUrl.substring(0, req.baseUrl.search('posts') - 1),
          host: getHost(req) + '/',
        },
        id: getHost(req) + req.baseUrl + '/' + comment.toJSON().id,
      };
    }),
  });
};

export { createComment, getPostComment, getPostComments };
