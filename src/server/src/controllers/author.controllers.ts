import { Request, RequestHandler, Response } from 'express';
import { unauthorized } from '../handlers/auth.handlers';
import { isAdmin } from '../handlers/author.handlers';
import Author from '../models/Author';
import CommentLike from '../models/CommentLike';
import Comment from '../models/Comment';
import Post from '../models/Post';
import PostLike from '../models/PostLike';
import {
  authorPublicAttributes,
  serializeAuthor,
} from '../serializers/author.serializers';
import { serializeLike } from '../serializers/like.serializers';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';

const deleteAuthor = async (req: AuthenticatedRequest, res: Response) => {
  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }
  try {
    await author.destroy();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
  }
  res.status(200).send();
};

const getAllAuthors = async (req: PaginationRequest, res: Response) => {
  const authors = await Author.findAll({
    where: {
      nodeServiceUrl: null,
    },
    attributes: authorPublicAttributes,
    offset: req.offset,
    limit: req.limit,
  });

  res.send({
    type: 'authors',
    items: await Promise.all(
      authors.map((author) => serializeAuthor(author, req))
    ),
  });
};

const getAuthor = async (req: Request, res: Response) => {
  const author = await Author.findOne({
    attributes: authorPublicAttributes,
    where: { id: req.params.authorId },
  });
  if (author === null) {
    res.status(404).send();
    return;
  }
  res.send(await serializeAuthor(author, req));
};

const getCurrentAuthor = async (req: AuthenticatedRequest, res: Response) => {
  const author = await Author.findOne({
    attributes: authorPublicAttributes,
    where: { id: req.authorId },
  });
  if (author === null) {
    res.status(400).send();
    return;
  }
  res.send(await serializeAuthor(author, req));
};

const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { email, displayName, github, profileImage, verified } = req.body;

  // Only admins can change verified status
  if (verified !== undefined && !(await isAdmin(req.authorId))) {
    unauthorized(res);
    return;
  }

  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }

  try {
    await author.update({
      ...(email && { email: email }),
      ...(displayName && { displayName: displayName }),
      ...(github && { github: github }),
      ...(profileImage && { profileImage: profileImage }),
      ...(verified !== undefined && { verified: verified }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
    return;
  }
  res.status(200).send();
};

const getAuthorLiked: RequestHandler = async (req, res) => {
  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }

  const postLikes = await PostLike.findAll({
    where: {
      authorId: req.params.authorId,
    },
    include: [
      { model: Author, as: 'author' },
      {
        model: Post,
        attributes: ['id', 'visibility'],
        where: {
          visibility: 'PUBLIC',
        },
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
  const commentLikes = await CommentLike.findAll({
    where: {
      authorId: req.params.authorId,
    },
    include: [
      { model: Author, as: 'author' },
      {
        model: Comment,
        attributes: ['id'],
        include: [
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'visibility'],
            where: {
              visibility: 'PUBLIC',
            },
            include: [
              {
                model: Author,
                as: 'author',
                attributes: ['id'],
              },
            ],
          },
        ],
      },
    ],
  });

  res.status(200).json({
    type: 'liked',
    items: await Promise.all(
      [...postLikes, ...commentLikes].map((like) => serializeLike(like, req))
    ),
  });
};

export {
  deleteAuthor,
  getAllAuthors,
  getAuthor,
  getCurrentAuthor,
  updateProfile,
  getAuthorLiked,
};
