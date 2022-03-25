import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';

const createComment = async (req: AuthenticatedRequest, res: Response) => {
  if (req.params.comment_id) {
    const comment_exists = await Comment.findOne({
      where: { id: req.params.post_id },
    });
    if (comment_exists !== null) {
      res.status(400).send({ error: 'Post already exists' });
      return;
    }
  }

  const { commentStr, contentType } = req.body;

  const post = await Post.findOne({
    where: {
      id: req.params.post_id,
    },
  });
  if (post === null) {
    res.status(404).send();
    return;
  }
  try {
    const comment = await Comment.create({
      ...(req.params.comment_id && { id: req.params.comment_id }),
      comment: commentStr,
      contentType: contentType,
    });
    post.addComment(comment);
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
      id: req.params.comment_id,
      post_id: req.params.post_id,
    },
    include: {
      model: Post,
      attributes: [
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
      ],
      as: 'post',
    },
  });
  if (comment === null) {
    res.status(404).send();
    return;
  }
  res.send({
    type: 'comment',
    ...comment.toJSON(),
    post: { type: 'post', ...comment.toJSON().post },
  });
};

const getPostComments = async (req: PaginationRequest, res: Response) => {
  const comments = await Comment.findAll({
    attributes: ['comment', 'contentType', 'published', 'id'],
    where: {
      post_id: req.params.post_id,
    },
    include: {
      model: Post,
      attributes: [
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
      ],
      as: 'post',
    },
    offset: req.offset,
    limit: req.limit,
  });
  res.send({
    type: 'comments',
    items: comments.map((comment) => {
      return {
        type: 'comment',
        ...comment.toJSON(),
        author: { type: 'post', ...comment.toJSON().post },
      };
    }),
  });
};


export {
  createComment,
  getPostComment,
  getPostComments,
};
