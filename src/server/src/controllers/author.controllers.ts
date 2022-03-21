import { Request, Response } from 'express';
import Author from '../models/Author';
import { AuthenticatedRequest } from '../types/auth';
import { PaginationRequest } from '../types/pagination';
import { getHost } from '../utilities/host';

const authorPublicAttributes = ['id', 'displayName', 'github', 'profileImage'];

const getAllAuthors = async (req: PaginationRequest, res: Response) => {
  const authors = await Author.findAll({
    attributes: authorPublicAttributes,
    offset: req.offset,
    limit: req.limit,
  });
  res.send({
    type: 'authors',
    items: authors.map((author) => {
      return {
        type: 'author',
        ...author.toJSON(),
        id: getHost(req) + req.baseUrl + '/' + author.id,
        url: getHost(req) + req.baseUrl + '/' + author.id,
        host: getHost(req) + '/',
      };
    }),
  });
};

const getAuthor = async (req: Request, res: Response) => {
  const author = await Author.findOne({
    attributes: authorPublicAttributes,
    where: { id: req.params.id },
  });
  if (author === null) {
    res.status(404).send();
    return;
  }
  res.send({
    type: 'author',
    ...author.toJSON(),
    id: getHost(req) + req.baseUrl + '/' + author.id,
    url: getHost(req) + req.baseUrl + '/' + author.id,
    host: getHost(req) + '/',
  });
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
  res.send({
    type: 'author',
    ...author.toJSON(),
    id: getHost(req) + req.baseUrl + '/' + author.id,
    url: getHost(req) + req.baseUrl + '/' + author.id,
    host: getHost(req) + '/',
  });
};

const updateProfile = async (req: Request, res: Response) => {
  const { email, displayName, github, profileImage } = req.body;
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
    return;
  }
  res.status(200).send();
};

export { getAllAuthors, getAuthor, getCurrentAuthor, updateProfile };
