import { Request, Response } from 'express';
import Author from '../models/Author';
import Post from '../models/Post';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { getHost } from '../utilities/host';

const createPost = async (req: AuthenticatedRequest, res: Response) => {
  if (req.params.post_id) {
    const post_exists = await Post.findOne({
      where: { id: req.params.post_id },
    });
    if (post_exists !== null) {
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

  const author = await Author.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (author === null) {
    res.status(404).send();
    return;
  }
  try {
    const post = await Post.create({
      ...(req.params.post_id && { id: req.params.post_id }),
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
    where: { id: req.params.post_id, author_id: req.params.id },
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

const getAuthorPost = async (req: Request, res: Response) => {
  const post = await Post.findOne({
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
    where: {
      id: req.params.post_id,
      author_id: req.params.id,
    },
    include: {
      model: Author,
      attributes: ['id', 'displayName', 'github', 'profileImage'],
      as: 'author',
    },
  });
  if (post === null) {
    res.status(404).send();
    return;
  }
  res.send({
    type: 'post',
    ...post.toJSON(),
    id: getHost(req) + req.baseUrl + '/' + post.id,
    author: {
      type: 'author',
      ...post.toJSON().author,
      id: getHost(req) + '/author/' + post.author.id,
      url: getHost(req) + '/author/' + post.author.id,
      host: getHost(req) + '/',
    },
  });
};

const getAuthorPosts = async (req: PaginationRequest, res: Response) => {
  const posts = await Post.findAll({
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
    where: {
      author_id: req.params.id,
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
    type: 'posts',
    items: posts.map((post) => {
      return {
        type: 'post',
        ...post.toJSON(),
        id: getHost(req) + req.baseUrl + '/' + post.id,
        author: {
          type: 'author',
          ...post.toJSON().author,
          id: getHost(req) + '/author/' + post.author.id,
          url: getHost(req) + '/author/' + post.author.id,
          host: getHost(req) + '/',
        },
      };
    }),
  });
};

const getPostImage = async (req: Request, res: Response) => {
  const post = await Post.findOne({
    attributes: ['contentType', 'image'],
    where: {
      id: req.params.post_id,
      author_id: req.params.id,
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
    where: { id: req.params.post_id, author_id: req.params.id },
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

export {
  createPost,
  deleteAuthorPost,
  getAuthorPost,
  getAuthorPosts,
  getPostImage,
  updateAuthorPost,
};
