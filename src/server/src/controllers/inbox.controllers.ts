import { Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';

import { unauthorized } from '../handlers/auth.handlers';

import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
  NodeAuthenticatedRequest,
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

const requireRemoteNode = (
  req: AuthenticatedRequest | NodeAuthenticatedRequest,
  res: Response
): req is NodeAuthenticatedRequest => {
  if (req.requesterType !== 'node') {
    res
      .status(401)
      .header('WWW-Authenticate', 'Basic')
      .json({ error: 'Must be authenticated as remote node' });
    return false;
  }
  return true;
};

const sendToInbox = async (
  req: AuthenticatedRequest | NodeAuthenticatedRequest,
  res: Response
) => {
  // Check if author exists
  if (Author.findByPk(req.params.authorId) === null) {
    res.status(404).json({ error: 'Author not found' });
    return;
  }

  // Type of the item being sent
  const type = (req.body.type as string).toLowerCase();

  if (type === 'post') {
    // The post must be from a remote node,
    // otherwise the inbox should have just been updated in the post creation handler
    if (requireRemoteNode(req, res)) await sendPostToInbox(req, res);
  } else if (type === 'follow') {
    await sendFollowRequestToInbox(req, res);
  } else if (type === 'like') {
    await sendLikeToInbox(req, res);
  } else {
    throw new Error(`Invalid type ${req.body.type}`);
  }
};

const sendPostToInbox = async (
  req: NodeAuthenticatedRequest,
  res: Response
) => {
  // Extract the service URL and ID of the post from the ID field
  const postIdMatch = /^(.*?)\/authors\/[^/]+\/posts\/([^/]+)/.exec(
    req.body.id
  );
  if (postIdMatch === null) {
    res.status(400).json({ error: 'Invalid post id field' });
    return;
  }
  const [postServiceUrl, postId] = postIdMatch.slice(1);
  if (postServiceUrl !== req.node.serviceUrl) {
    res.status(400).json({
      error: `Invalid post service URL ${postServiceUrl}, should be ${req.node.serviceUrl}`,
    });
    return;
  }

  const postAuthorIdMatch = /^(.*?)\/authors\/([^/]+)/.exec(req.body.author.id);
  if (postAuthorIdMatch === null) {
    res.status(400).json({ error: 'Invalid post author id field' });
    return;
  }
  const [postAuthorServiceUrl, postAuthorId] = postAuthorIdMatch.slice(1);
  if (postAuthorServiceUrl !== req.node.serviceUrl) {
    res.status(400).json({
      error: `Invalid post author service URL ${postAuthorServiceUrl}, should be ${req.node.serviceUrl}`,
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

  await InboxItem.create({
    recipientId: req.params.authorId,
    postId,
  });

  res.status(200).send();
};

const sendFollowRequestToInbox = async (
  req: AuthenticatedRequest | NodeAuthenticatedRequest,
  res: Response
) => {
  const requesterIdMatch = /(.*?)\/authors\/([^/]+)/.exec(req.body.actor.id);
  if (requesterIdMatch === null) {
    res.status(400).json({ error: 'Invalid actor id' });
    return;
  }
  const [requesterServiceUrl, requesterId] = requesterIdMatch.slice(1);

  // Create the author for the requester if neccessary
  await Author.findOrCreate({
    where: {
      id: requesterId,
      nodeServiceUrl: requesterServiceUrl,
    },
  });

  try {
    const followRequest = await FollowRequest.create({
      requesteeId: req.params.authorId,
      requesterId: requesterId,
    });

    await InboxItem.create({
      recipientId: req.params.authorId,
      requestId: followRequest.id,
    });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      res.status(400).json({
        error: 'Actor has already requested to follow this author',
      });
      return;
    }
  }
};

const sendLikeToInbox = async (
  req: AuthenticatedRequest | NodeAuthenticatedRequest,
  res: Response
) => {
  // Determine the ID of the author that is making the like
  let likerId: string;
  if (req.requesterType === 'author') {
    likerId = req.authorId;
  } else if (req.requesterType === 'node') {
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
    unauthorized(res);
    return;
  }

  // Extract the ID of the liked post or comment from the object field
  const parts = req.body.object.split('/');
  const likedObjectId = parts[parts.length - 1];
  const likedObjectType = parts[parts.length - 2];

  try {
    if (likedObjectType.startsWith('post')) {
      await PostLike.findOrCreate({
        where: {
          authorId: likerId,
          postId: likedObjectId,
        },
      });
    } else if (likedObjectType.startsWith('comment')) {
      await CommentLike.findOrCreate({
        where: {
          authorId: likerId,
          postId: likedObjectId,
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

const clearInbox: AuthenticatedRequestHandler = async (req, res) => {
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
