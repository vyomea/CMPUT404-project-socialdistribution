import { Request, Response } from 'express';
import Author from '../models/Author';
import Follower from '../models/Follower';
import { AuthenticatedRequest } from '../types/auth';
import { getHost } from '../utilities/host';
import { unauthorized } from '../handlers/auth.handlers';

const authorPublicAttributes = ['id', 'displayName', 'github', 'profileImage'];

const addFollower = async (req: AuthenticatedRequest, res: Response) => {
  if (req.params.id !== req.authorId) {
    unauthorized(res);
    return;
  }
  if (req.params.id === req.params.foreign_author_id) {
    res.status(400).send({ error: 'Cannot follow yourself' });
    return;
  }

  const author = await Author.findByPk(req.params.id);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const foreignAuthor = await Author.findByPk(req.params.foreign_author_id);
  if (foreignAuthor === null) {
    res.status(404).send();
  }
  if (await author.hasFollower(foreignAuthor)) {
    res.status(400).send({ error: 'Already following' });
    return;
  }

  try {
    await author.addFollower(foreignAuthor);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

const checkFollower = async (req: Request, res: Response) => {
  if (req.params.id === req.params.foreign_author_id) {
    res.status(400).send({ error: 'Cannot check if following yourself' });
    return;
  }

  const author = await Author.findByPk(req.params.id);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const foreignAuthor = await Author.findByPk(req.params.foreign_author_id);
  if (foreignAuthor === null) {
    res.status(404).send();
  }
  res.send({ result: await author.hasFollower(foreignAuthor) });
};

const getAuthorFollowers = async (req: Request, res: Response) => {
  const followers = await Follower.findAll({
    where: {
      authorId: req.params.id,
    },
    attributes: [],
    include: {
      model: Author,
      attributes: authorPublicAttributes,
      as: 'author',
    },
  });
  res.send({
    type: 'followers',
    items: followers.map((follower) => {
      return {
        type: 'author',
        ...follower.toJSON().author,
        id: getHost(req) + '/author/' + follower.author.id,
        url: getHost(req) + '/author/' + follower.author.id,
        host: getHost(req) + '/',
      };
    }),
  });
};

const removeFollower = async (req: Request, res: Response) => {
  if (req.params.id === req.params.foreign_author_id) {
    res.status(400).send({ error: 'Cannot unfollow yourself' });
  }

  const author = await Author.findByPk(req.params.id);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const foreignAuthor = await Author.findByPk(req.params.foreign_author_id);
  if (foreignAuthor === null) {
    res.status(404).send();
  }

  if (!(await author.hasFollower(foreignAuthor))) {
    res.status(400).send({ error: 'Cannot unfollow when not following' });
    return;
  }

  try {
    await author.removeFollower(foreignAuthor);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

export { addFollower, checkFollower, getAuthorFollowers, removeFollower };
