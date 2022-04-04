import { Request, Response } from 'express';
import { unauthorized } from '../handlers/auth.handlers';
import { isAdmin } from '../handlers/author.handlers';
import Author from '../models/Author';
import {
  authorPublicAttributes,
  serializeAuthor,
} from '../serializers/author.serializers';
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
      serviceUrl: null,
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

export {
  deleteAuthor,
  getAllAuthors,
  getAuthor,
  getCurrentAuthor,
  updateProfile,
};
