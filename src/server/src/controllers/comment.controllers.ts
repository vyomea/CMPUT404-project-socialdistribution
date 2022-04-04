import { Request, Response } from 'express';
import Author from '../models/Author';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { serializeComment } from '../serializers/comment.serializers';

const createComment = async (
  req: AuthenticatedRequest & PaginationRequest,
  res: Response
) => {
  const { comment, contentType } = req.body;
  const commentStr = comment;

  const post = await Post.findOne({
    where: {
      id: req.params.postId,
    },
  });
  const author = await Author.findOne({
    where: {
      id: req.authorId,
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

// this should not be used as not in the specs, but is there for testing
const getPostComment = async (req: Request, res: Response) => {
  const comment = await Comment.findOne({
    attributes: ['comment', 'contentType', 'published', 'id'],
    where: {
      post_id: req.params.postId,
    },
    include: [
      {
        model: Author,
        attributes: ['id', 'displayName', 'github', 'profileImage'],
        as: 'author',
      },
      {
        model: Post,
        attributes: ['id'],
        as: 'post',
        include: [
          {
            model: Author,
            attributes: ['id'],
            as: 'author',
          },
        ],
      },
    ],
  });
  if (comment === null) {
    res.status(404).send({ error: 'Comment does not exist' });
    return;
  }

  res.send(await serializeComment(comment, req));
};

const getPostComments = async (req: PaginationRequest, res: Response) => {
  const post = await Post.findByPk(req.params.postId);
  if (post === null) {
    res.status(404).send({ error: 'Post does not exist' });
    return;
  }

  const comments = await Comment.findAll({
    attributes: ['comment', 'contentType', 'published', 'id'],
    where: {
      post_id: req.params.postId,
    },
    include: [
      {
        model: Author,
        attributes: ['id', 'displayName', 'github', 'profileImage'],
        as: 'author',
      },
      {
        model: Post,
        attributes: ['id'],
        as: 'post',
        include: [
          {
            model: Author,
            attributes: ['id'],
            as: 'author',
          },
        ],
      },
    ],
    offset: req.offset,
    limit: req.limit,
  });

  res.send({
    type: 'comments',
    comments: await Promise.all(
      comments.map((comment) => serializeComment(comment, req))
    ),
  });
};

export { createComment, getPostComment, getPostComments };
