import { Request, Response } from 'express';
import { unauthorized } from '../handlers/auth.handlers';
import { isAdmin } from '../handlers/author.handlers';
import Author from '../models/Author';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { getHost } from '../utilities/host';
import { pick } from '../utilities/pick';

const publicAttributes = [
  'id',
  'displayName',
  'github',
  'profileImage',
  'isAdmin',
  'verified',
];

export const serializeAuthor = (
  author: Author,
  req: Request
): Record<string, unknown> => ({
  type: 'author',
  ...pick(author.toJSON(), publicAttributes),
  id: `${getHost(req)}/authors/${author.id}`,
  url: `${getHost(req)}/authors/${author.id}`,
  host: `${getHost(req)}/`,
});

const deleteAuthor = async (req: AuthenticatedRequest, res: Response) => {
  const author = await Author.findByPk(req.params.id);
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
    attributes: publicAttributes,
    offset: req.offset,
    limit: req.limit,
  });
  res.send({
    type: 'authors',
    items: authors.map((author) => serializeAuthor(author, req)),
  });
};

const getAuthor = async (req: Request, res: Response) => {
  const author = await Author.findOne({
    attributes: publicAttributes,
    where: { id: req.params.id },
  });
  if (author === null) {
    res.status(404).send();
    return;
  }
  res.send(serializeAuthor(author, req));
};

const getCurrentAuthor = async (req: AuthenticatedRequest, res: Response) => {
  const author = await Author.findOne({
    attributes: publicAttributes,
    where: { id: req.authorId },
  });
  if (author === null) {
    res.status(400).send();
    return;
  }
  res.send(serializeAuthor(author, req));
};

const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { email, displayName, github, profileImage, verified } = req.body;

  if (verified && !(await isAdmin(req.authorId))) {
    unauthorized(res);
    return;
  }

  const author = await Author.findOne({ where: { id: req.params.id } });
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
      ...(verified && { verified: verified }),
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
