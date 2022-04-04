import { Request, Response } from 'express';
import { FindOptions } from 'sequelize';
import Author from '../models/Author';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { serializePost } from '../serializers/post.serializers';
import { isFriends } from '../handlers/follower.handlers';
import { serializeLike } from '../serializers/like.serializers';
import PostLike from '../models/PostLike';

const createPost = async (req: AuthenticatedRequest, res: Response) => {
  if (req.params.postId) {
    const postExists = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (postExists !== null) {
      res.status(400).send({ error: 'Post already exists' });
      return;
    }
  }

  const {
    title,
    description,
    source,
    origin,
    contentType,
    content,
    categories,
    visibility,
  } = req.body;

  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }
  try {
    const post = await Post.create({
      ...(req.params.postId && { id: req.params.postId }),
      title: title,
      description: description,
      source: source,
      origin: origin,
      contentType:
        contentType === 'image' ? `${req.file.mimetype};base64` : contentType,
      ...(contentType === 'image' && {
        image: Buffer.from(req.file.buffer).toString('base64'),
      }),
      content: content,
      categories: categories ? JSON.parse(categories) : [],
      visibility: visibility,
    });
    await author.addPost(post);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
    return;
  }

  res.status(200).send();
};

const deleteAuthorPost = async (req: AuthenticatedRequest, res: Response) => {
  const post = await Post.findOne({
    where: { id: req.params.postId, author_id: req.params.authorId },
    include: { model: Author, as: 'author' },
  });
  if (post === null) {
    res.status(404).send();
    return;
  }
  try {
    await post.destroy();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

// FindOptions for querying posts on this node along with their author and comments information.
const postFindOptions = (
  authorId?: string,
  postId?: string,
  isFriend?: boolean
): FindOptions => ({
  where: {
    ...(authorId ? { author_id: authorId } : {}),
    ...(postId ? { id: postId } : {}),
    ...(isFriend
      ? { visibility: ['PUBLIC', 'FRIENDS'] }
      : { visibility: ['PUBLIC'] }),
    nodeServiceUrl: null,
  },
  include: [
    // Author of the post
    {
      model: Author,
      attributes: ['id', 'displayName', 'github', 'profileImage'],
      as: 'author',
    },
    // Comments on the post
    {
      model: Comment,
      attributes: ['comment', 'contentType', 'published', 'id'],
      as: 'comments',
      include: [
        // Author of the comments
        {
          model: Author,
          attributes: ['id', 'displayName', 'github', 'profileImage'],
          as: 'author',
        },
        // The post the comment is on (needed so that `comment.post` will work)
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
    },
  ],
});

const getAllPublicPosts = async (req: PaginationRequest, res: Response) => {
  const posts = await Post.findAll({
    ...postFindOptions(undefined, undefined, false),
    offset: req.offset,
    limit: req.limit,
  });
  res.send({
    type: 'posts',
    items: await Promise.all(
      posts.map((post) => serializePost(post, req, post.comments))
    ),
  });
};

const getAuthorPost = async (
  req: AuthenticatedRequest & Request,
  res: Response
) => {
  let isFriend = false;
  if (req.authorId) {
    isFriend = await isFriends(req.authorId, req.params.authorId);
  }
  const post = await Post.findOne({
    ...postFindOptions(req.params.authorId, req.params.postId, isFriend),
  });

  if (post === null) {
    res.status(404).send();
    return;
  }
  res.send(await serializePost(post, req, post.comments));
};

const getAuthorPosts = async (
  req: AuthenticatedRequest & PaginationRequest,
  res: Response
) => {
  let isFriend = false;
  if (req.authorId) {
    isFriend = await isFriends(req.authorId, req.params.authorId);
  }

  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const posts = await Post.findAll({
    ...postFindOptions(req.params.authorId, undefined, isFriend),
    offset: req.offset,
    limit: req.limit,
  });
  res.send({
    type: 'posts',
    items: await Promise.all(
      posts.map((post) => serializePost(post, req, post.comments))
    ),
  });
};

const getPostImage = async (
  req: AuthenticatedRequest & Request,
  res: Response
) => {
  let isFriend = false;
  if (req.authorId) {
    isFriend = await isFriends(req.authorId, req.params.authorId);
  }

  const post = await Post.findOne({
    attributes: ['contentType', 'image'],
    where: {
      id: req.params.postId,
      author_id: req.params.authorId,
      ...(isFriend
        ? { visibility: ['PUBLIC', 'FRIENDS'] }
        : { visibility: ['PUBLIC'] }),
    },
  });
  if (post === null || !post.contentType.includes('image')) {
    res.sendStatus(404);
    return;
  }
  const image = Buffer.from(post.image.toString(), 'base64');
  res.setHeader('Content-Type', post.contentType.split(';')[0]);
  res.setHeader('Content-Length', image.byteLength);
  res.send(image);
};

const updateAuthorPost = async (req: AuthenticatedRequest, res: Response) => {
  const post = await Post.findOne({
    where: { id: req.params.postId, author_id: req.params.authorId },
  });
  if (post === null) {
    res.status(404).send();
    return;
  }
  const {
    title,
    description,
    source,
    origin,
    contentType,
    content,
    categories,
    visibility,
  } = req.body;

  try {
    await post.update({
      ...(title && { title: title }),
      ...(description && { description: description }),
      ...(source && { source: source }),
      ...(origin && { origin: origin }),
      ...(contentType && {
        contentType:
          contentType === 'image' ? `${req.file.mimetype};base64` : contentType,
      }),
      ...(content && { content: content }),
      ...(contentType === 'image' && {
        image: Buffer.from(req.file.buffer).toString('base64'),
      }),
      ...(categories && {
        categories: categories ? JSON.parse(categories) : [],
      }),
      ...(visibility && { visibility: visibility }),
    });
  } catch (error) {
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

const getPostLikes = async (req: AuthenticatedRequest, res: Response) => {
  let isFriend = false;
  if (req.authorId) {
    isFriend = await isFriends(req.authorId, req.params.authorId);
  }

  const post = await Post.findOne({
    ...postFindOptions(req.params.authorId, req.params.postId, isFriend),
  });

  if (post === null) {
    res.status(404).send();
    return;
  }

  const likes = await PostLike.findAll({
    where: {
      postId: req.params.postId,
    },
    include: [
      {
        model: Author,
        as: 'author',
      },
      {
        model: Post,
        as: 'post',
        attributes: ['id'],
        include: [
          {
            model: Author,
            as: 'author',
            attributes: ['id'],
          },
        ],
      },
    ],
  });

  res.status(200).json({
    type: 'likes',
    items: await Promise.all(likes.map((like) => serializeLike(like, req))),
  });
};

export {
  createPost,
  deleteAuthorPost,
  getAllPublicPosts,
  getAuthorPost,
  getAuthorPosts,
  getPostImage,
  updateAuthorPost,
  getPostLikes,
};
