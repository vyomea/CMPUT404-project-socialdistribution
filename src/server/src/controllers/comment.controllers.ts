import { Request, Response } from 'express';
import Author from '../models/Author';
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
      res.status(400).send({ error: 'Comment already exists' });
      return;
    }
  }

  const { comment, contentType } = req.body;
  const commentStr = comment;

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
    author: { type: 'author', ...comment.toJSON().author },
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
        author: { type: 'author', ...comment.toJSON().author },
      };
    }),
  });
};


export {
  createComment,
  getPostComment,
  getPostComments,
};
