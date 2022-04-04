import { Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';

import { unauthorized } from '../handlers/auth.handlers';

import {
  AuthenticatedRequest,
  FromNodeRequest,
  ToNodeRequest,
} from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import FollowRequest from '../models/FollowRequest';
import Author from '../models/Author';
import Comment from '../models/Comment';
import CommentLike from '../models/CommentLike';
import InboxItem from '../models/InboxItem';
import PostLike from '../models/PostLike';
import Post from '../models/Post';
import { getHost } from '../utilities/host';
import { serializePost } from '../serializers/post.serializers';
import { serializeComment } from '../serializers/comment.serializers';
import { serializeLike } from '../serializers/like.serializers';
import { serializeFollowRequest } from '../serializers/follow-request.serializers';
import axios from 'axios';
import { remoteRequestConfig } from '../utilities/remote-request-config';
import { serializeAuthor } from '../serializers/author.serializers';
import { createComment, receiveRemoteComment } from './comment.controllers';

const getInbox = async (
  req: AuthenticatedRequest & PaginationRequest,
  res: Response
) => {
  // Only allow the inbox of the requesting author to be accessed, unless they are an admin
  const requester = await Author.findOne({
    where: { id: req.authorId, nodeServiceUrl: null },
  });
  if (req.params.authorId !== req.authorId && !requester.isAdmin) {
    return unauthorized(res);
  }

  const items = await InboxItem.findAll({
    where: {
      recipientId: req.params.authorId,
    },
    include: [
      {
        model: Post,
        as: 'post',
        include: [
          {
            model: Author,
            as: 'author',
          },
        ],
      },
      {
        model: CommentLike,
        as: 'commentLike',
        include: [
          {
            model: Author,
            as: 'author',
          },
          {
            model: Comment,
            as: 'comment',
            include: [
              {
                model: Post,
                as: 'post',
                include: [
                  {
                    model: Author,
                    as: 'author',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: PostLike,
        as: 'postLike',
        include: [
          {
            model: Author,
            as: 'author',
          },
          {
            model: Post,
            as: 'post',
            include: [
              {
                model: Author,
                as: 'author',
              },
            ],
          },
        ],
      },
      {
        model: Comment,
        as: 'comment',
      },
      {
        model: FollowRequest,
        as: 'request',
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    type: 'inbox',
    author: `${getHost(req)}/authors/${req.params.authorId}`,
    items: await Promise.all(
      items.map((item) => {
        if (item.post) return serializePost(item.post, req);
        if (item.commentLike) return serializeLike(item.commentLike, req);
        if (item.postLike) return serializeLike(item.postLike, req);
        if (item.request) return serializeFollowRequest(item.request, req);
        if (item.comment) return serializeComment(item.comment, req);
        throw new Error('unknown item type');
      })
    ),
  });
};

const sendToInbox = async (
  req: AuthenticatedRequest | FromNodeRequest | ToNodeRequest,
  res: Response
) => {
  // Check if this is a local request destined for another node
  if (req.requestType === 'toNode') {
    await forwardInboxItemToNode(req, res);
    return;
  }

  // This item is destined for a local inbox, but
  // it may from either a local user or a remote node.

  // Check if author exists
  if (Author.findByPk(req.params.authorId) === null) {
    res.status(404).json({ error: 'Author not found' });
    return;
  }

  // Type of the item being sent
  const type = (req.body.type as string).toLowerCase();

  if (type === 'post') {
    await receivePostInLocalInbox(req, res);
  } else if (type === 'follow') {
    await receiveFollowRequestInLocalInbox(req, res);
  } else if (type === 'like') {
    await receiveLikeInLocalInbox(req, res);
  } else if (type === 'comment') {
    if (req.requestType === 'fromNode') {
      let postUrl: string;
      const regex = /.*?\/posts\/([^/]+)/;
      if (typeof req.body.post === 'string') {
        postUrl = req.body.post;
      } else if (
        typeof req.body.post === 'object' &&
        typeof req.body.post.id === 'string'
      ) {
        postUrl = req.body.post.id;
      } else if (typeof req.body.object === 'string') {
        postUrl = req.body.object;
      } else if (typeof req.body.id === 'string') {
        postUrl = req.body.id;
      } else {
        res
          .status(400)
          .json({ error: "Can't find ID of the post in that comment" });
        return;
      }
      const postMatch = regex.exec(postUrl);
      if (postMatch === null) {
        res
          .status(400)
          .json({ error: "Can't find ID of the post in that comment" });
        return;
      }
      const postId = postMatch[1];
      await receiveRemoteComment(postId, req, res);
    } else {
      res
        .status(400)
        .json({ error: 'Send comment to the /comments endpoint instead' });
      return;
    }
  } else {
    throw new Error(`Invalid type ${req.body.type}`);
  }
};

const receivePostInLocalInbox = async (
  req: AuthenticatedRequest | FromNodeRequest,
  res: Response
) => {
  // The post must be from a remote node,
  // otherwise the inbox should have just been updated in the post creation handler
  if (req.requestType !== 'fromNode') {
    res.status(401).json({ error: 'Must be authenticated as remote node' });
    return;
  }

  // Extract the service URL and ID of the post from the ID field
  const postIdMatch = /^(.*?)\/authors\/[^/]+\/posts\/([^/]+)/.exec(
    req.body.id
  );
  if (postIdMatch === null) {
    res.status(400).json({ error: 'Invalid post id field' });
    return;
  }
  const [postServiceUrl, postId] = postIdMatch.slice(1);
  if (postServiceUrl !== req.fromNode.serviceUrl) {
    res.status(400).json({
      error: `Invalid post service URL ${postServiceUrl}, should be ${req.fromNode.serviceUrl}`,
    });
    return;
  }

  const postAuthorIdMatch = /^(.*?)\/authors\/([^/]+)/.exec(req.body.author.id);
  if (postAuthorIdMatch === null) {
    res.status(400).json({ error: 'Invalid post author id field' });
    return;
  }
  const [postAuthorServiceUrl, postAuthorId] = postAuthorIdMatch.slice(1);
  if (postAuthorServiceUrl !== req.fromNode.serviceUrl) {
    res.status(400).json({
      error: `Invalid post author service URL ${postAuthorServiceUrl}, should be ${req.fromNode.serviceUrl}`,
    });
    return;
  }

  // Create the remote author in the database if necessary
  const author = (
    await Author.findOrCreate({
      where: {
        id: postAuthorId,
        nodeServiceUrl: postServiceUrl,
      },
    })
  )[0];

  // Create the remote post in the database if necessary
  const post = (
    await Post.findOrCreate({
      where: {
        id: postId,
        nodeServiceUrl: postServiceUrl,
      },
    })
  )[0];
  await author.addPost(post);

  await InboxItem.findOrCreate({
    where: {
      recipientId: req.params.authorId,
      postId,
    },
  });

  res.status(200).send();
};

const receiveFollowRequestInLocalInbox = async (
  req: AuthenticatedRequest | FromNodeRequest,
  res: Response
) => {
  let requesterId: string;
  if (req.requestType === 'author') {
    requesterId = req.authorId;
  } else if (req.requestType === 'fromNode') {
    const requesterIdMatch = /(.*?)\/authors\/([^/]+)/.exec(req.body.actor.id);
    if (requesterIdMatch === null) {
      res.status(400).json({ error: 'Invalid actor id' });
      return;
    }
    const requesterServiceUrl = requesterIdMatch[1];
    requesterId = requesterIdMatch[2];

    // Create the author for the requester if neccessary
    await Author.findOrCreate({
      where: {
        id: requesterId,
        nodeServiceUrl: requesterServiceUrl,
      },
    });
  }
  if (!requesterId) {
    throw new Error('missing requesterId');
  }

  try {
    const followRequest = await FollowRequest.create({
      requesteeId: req.params.authorId,
      requesterId: requesterId,
    });

    await InboxItem.findOrCreate({
      where: {
        recipientId: req.params.authorId,
        requestId: followRequest.id,
      },
    });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      res.status(400).json({
        error: 'Actor has already requested to follow this author',
      });
      return;
    }
  }

  res.status(200).send();
};

const receiveLikeInLocalInbox = async (
  req: AuthenticatedRequest | FromNodeRequest,
  res: Response
) => {
  // Determine the ID of the author that is making the like
  let likerId: string;
  if (req.requestType === 'author') {
    likerId = req.authorId;
  } else if (req.requestType === 'fromNode') {
    const likerIdMatch = /(.*?)\/authors\/([^/]+)/.exec(req.body.author.id);
    if (likerIdMatch === null) {
      res.status(400).json({ error: 'Invalid author id' });
      return;
    }
    const likerServiceUrl = likerIdMatch[1];
    likerId = likerIdMatch[2];

    // Create the author in the database for the liker if necessary
    await Author.findOrCreate({
      where: {
        id: likerId,
        nodeServiceUrl: likerServiceUrl,
      },
    });
  }
  if (!likerId) {
    throw new Error('missing likerId');
  }

  // Extract the ID of the liked post or comment from the object field
  const parts = req.body.object.split('/');
  const likedObjectId = parts[parts.length - 1];
  const likedObjectType = parts[parts.length - 2];

  try {
    if (likedObjectType.startsWith('post')) {
      const postLike = (
        await PostLike.findOrCreate({
          where: {
            authorId: likerId,
            postId: likedObjectId,
          },
        })
      )[0];
      await InboxItem.findOrCreate({
        where: {
          recipientId: (await Post.findByPk(likedObjectId)).authorId,
          postLikeId: postLike.id,
        },
      });
    } else if (likedObjectType.startsWith('comment')) {
      const commentLike = (
        await CommentLike.findOrCreate({
          where: {
            authorId: likerId,
            commentId: likedObjectId,
          },
        })
      )[0];
      await InboxItem.findOrCreate({
        where: {
          recipientId: (await Comment.findByPk(likedObjectId)).authorId,
          commentLikeId: commentLike.id,
        },
      });
    } else {
      res.status(400).json({ error: 'Invalid object type' });
      return;
    }
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      res.status(400).json({ error: 'Author has already liked that post' });
      return;
    } else if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ error: 'Liked object not found' });
      return;
    } else {
      throw err;
    }
  }

  res.status(200).send();
};

const forwardInboxItemToNode = async (req: ToNodeRequest, res: Response) => {
  // Type of the item being sent
  const type = (req.body.type as string).toLowerCase();
  const requestingAuthor = await Author.findByPk(req.authorId);
  const foreignAuthorUrl = `${req.toNode.serviceUrl}/authors/${req.params.authorId}`;

  let body: Record<string, unknown>;
  if (type === 'post') {
    // Posts are only sent to remotes when they created on this server
    res.status(400).json({
      error: 'Posts should originate only from the server, not the client',
    });
    return;
  } else if (type === 'follow') {
    body = {
      type: 'Follow',
      summary: `${requestingAuthor.displayName} wants to follow you`,
      actor: await serializeAuthor(requestingAuthor, req),
      object: {
        type: 'author',
        id: foreignAuthorUrl,
        url: foreignAuthorUrl,
        host: req.toNode.serviceUrl,
      },
    };
  } else if (type === 'like') {
    const foreignObjectUrl: string = req.body.object;
    const foreignObjectType = foreignObjectUrl.includes('comment')
      ? 'comment'
      : 'post';
    body = {
      type: 'Like',
      summary: `${requestingAuthor.displayName} likes your ${foreignObjectType}`,
      author: await serializeAuthor(requestingAuthor, req),
      object: foreignObjectUrl,
    };
  } else if (type === 'comment') {
    res
      .status(400)
      .json({ error: 'POST the comment to the comments endpoint instead' });
    return;
  } else {
    res.status(400).json({ error: `Unknown object type ${req.body.type}` });
    return;
  }
  try {
    const remoteResponse = await axios.post(
      `/authors/${req.params.authorId}/inbox`,
      body,
      remoteRequestConfig(req.toNode)
    );
    res.status(200).send(remoteResponse.data);
    return;
  } catch (e) {
    res.status(502).send();
    console.error(e);
    return;
  }
};

const clearInbox = async (req: AuthenticatedRequest, res: Response) => {
  // Only allow the inbox of the requesting author to be cleared, unless they are an admin
  const requester = await Author.findOne({
    where: { id: req.authorId, nodeServiceUrl: null },
  });
  if (req.params.authorId !== req.authorId && !requester.isAdmin) {
    return unauthorized(res);
  }

  await InboxItem.destroy({
    where: {
      recipientId: req.params.authorId,
    },
  });

  res.status(200).send();
};

export { getInbox, sendToInbox, clearInbox };
