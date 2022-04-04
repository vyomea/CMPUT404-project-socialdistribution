import axios from 'axios';
import { Request, RequestHandler, Response } from 'express';
import Author from '../models/Author';
import Comment from '../models/Comment';
import Post from '../models/Post';
import {
  AuthenticatedRequest,
  FromNodeRequest,
  ToNodeRequest,
} from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { serializeComment } from '../serializers/comment.serializers';
import { serializeLike } from '../serializers/like.serializers';
import CommentLike from '../models/CommentLike';
import { remoteRequestConfig } from '../utilities/remote-request-config';
import { serializeAuthor } from '../serializers/author.serializers';
import { unauthorized } from '../handlers/auth.handlers';
import { v4 } from 'uuid';

export const receiveRemoteComment = async (
  postId: string,
  req: FromNodeRequest,
  res: Response
) => {
  const content = req.body.comment;
  const contentType = req.body.contentType || 'text/plain';

  const post = await Post.findByPk(postId);
  if (post === null) {
    res.status(404).send();
    return;
  }

  const commentAuthorIdMatch = /.*?\/authors\/([^/]+)/.exec(req.body.author.id);
  if (commentAuthorIdMatch === null) {
    res.status(400).json({ error: 'Invalid comment author' });
    return;
  }
  const commentAuthorId = commentAuthorIdMatch[1];
  const commentAuthor = (
    await Author.findOrCreate({
      where: {
        id: commentAuthorId,
      },
    })
  )[0];

  const comment = await Comment.create({
    comment: content,
    contentType: contentType,
  });
  post.addComment(comment);
  commentAuthor.addComment(comment);

  res.status(200).send();
};

export const forwardCommentToNode = async (
  postAuthorId: string,
  postId: string,
  req: ToNodeRequest,
  res: Response
) => {
  if (!req.authorId) {
    unauthorized(res);
    return;
  }

  const remotePostUrl = `${req.toNode.serviceUrl}/authors/${postAuthorId}/posts/${postId}`;
  let remoteEndpoint: string;
  if (
    new URL(req.toNode.serviceUrl).host === 'tik-tak-toe-cmput404.herokuapp.com'
  ) {
    remoteEndpoint = `${remotePostUrl}/comments`;
  } else {
    remoteEndpoint = `/authors/${postAuthorId}/inbox`;
  }
  const body = {
    type: 'comment',
    comment: req.body.comment,
    contentType: req.body.contentType,
    author: await serializeAuthor(await Author.findByPk(req.authorId), req),
    post: remotePostUrl,
    id: `${remotePostUrl}/comments/${v4()}`,
  };
  try {
    const remoteResponse = await axios.post(
      remoteEndpoint,
      body,
      remoteRequestConfig(req.toNode)
    );
    res.status(200).send(remoteResponse.data);
  } catch (e) {
    console.error(e);
    res.status(502).send();
  }
};

const createComment = async (
  req: AuthenticatedRequest | FromNodeRequest | ToNodeRequest,
  res: Response
) => {
  if (req.requestType === 'toNode') {
    await forwardCommentToNode(
      req.params.authorId,
      req.params.postId,
      req,
      res
    );
    return;
  }

  if (req.requestType === 'fromNode') {
    await receiveRemoteComment(req.params.postId, req, res);
    return;
  }

  const { comment: commentStr, contentType } = req.body;

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
const getComment = async (req: Request, res: Response) => {
  const comment = await Comment.findOne({
    attributes: ['comment', 'contentType', 'published', 'id'],
    where: {
      post_id: req.params.postId,
      id: req.params.commentId,
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

const getComments = async (req: PaginationRequest, res: Response) => {
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

const getCommentLikes: RequestHandler = async (req, res) => {
  const comment = await Comment.findByPk(req.params.commentId);
  if (comment === null) {
    res.status(404).send();
    return;
  }

  const likes = await CommentLike.findAll({
    where: {
      commentId: req.params.commentId,
    },
    include: [
      {
        model: Comment,
        as: 'comment',
        attributes: ['id'],
        include: [
          {
            model: Author,
            as: 'author',
            attributes: ['id'],
          },
        ],
      },
      {
        model: Author,
        as: 'author',
      },
    ],
  });

  res.status(200).send({
    type: 'likes',
    items: await Promise.all(likes.map((like) => serializeLike(like, req))),
  });
};

export { createComment, getComment, getComments, getCommentLikes };
