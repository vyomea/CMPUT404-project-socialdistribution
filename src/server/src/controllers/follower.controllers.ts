import { Request, Response } from 'express';
import Author from '../models/Author';
import Follower from '../models/Follower';
import { AuthenticatedRequest } from '../types/auth';
import { unauthorized } from '../handlers/auth.handlers';
import { serializeAuthor } from '../serializers/author.serializers';
import FollowRequest from '../models/FollowRequest';

const authorPublicAttributes = ['id', 'displayName', 'github', 'profileImage'];

const addFollower = async (req: AuthenticatedRequest, res: Response) => {
  if (req.params.authorId !== req.authorId) {
    unauthorized(res);
    return;
  }
  if (req.params.authorId === req.params.foreign_author_id) {
    res.status(400).send({ error: 'Cannot follow yourself' });
    return;
  }

  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const foreignAuthor = await Author.findByPk(req.params.foreign_author_id);
  if (foreignAuthor === null) {
    res.status(404).send();
    return;
  }
  if (await author.hasFollower(foreignAuthor)) {
    res.status(400).send({ error: 'Already following' });
    return;
  }

  const followRequest = await FollowRequest.findOne({
    where: {
      requesterId: req.params.foreign_author_id,
      requesteeId: req.params.authorId,
    },
  });
  if (followRequest === null) {
    res.status(400).send({
      error: `${foreignAuthor.displayName} did not request to follow`,
    });
    return;
  }

  try {
    await followRequest.destroy();
    await author.addFollower(foreignAuthor);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

const checkFollower = async (req: Request, res: Response) => {
  if (req.params.authorId === req.params.foreign_author_id) {
    res.status(400).send({ error: 'Cannot check if following yourself' });
    return;
  }

  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const foreignAuthor = await Author.findByPk(req.params.foreign_author_id);
  if (foreignAuthor === null) {
    res.status(404).send();
    return;
  }
  res.send({ result: await author.hasFollower(foreignAuthor) });
};

const getAuthorFollowers = async (req: Request, res: Response) => {
  const followers = await Follower.findAll({
    where: {
      authorId: req.params.authorId,
    },
    attributes: [],
    include: {
      model: Author,
      attributes: authorPublicAttributes,
      as: 'follower',
    },
  });
  res.send({
    type: 'followers',
    items: await Promise.all(
      followers.map((follower) => serializeAuthor(follower.follower, req))
    ),
  });
};

const getAuthorFollowings = async (req: Request, res: Response) => {
  const followings = await Follower.findAll({
    where: {
      followerId: req.params.authorId,
    },
    attributes: [],
    include: [
      {
        model: Author,
        attributes: authorPublicAttributes,
        as: 'author',
      },
    ],
  });
  res.send({
    type: 'following',
    items: await Promise.all(
      followings.map((following) => serializeAuthor(following.author, req))
    ),
  });
};

const removeFollower = async (req: Request, res: Response) => {
  if (req.params.authorId === req.params.foreign_author_id) {
    res.status(400).send({ error: 'Cannot unfollow yourself' });
    return;
  }

  const author = await Author.findByPk(req.params.authorId);
  if (author === null) {
    res.status(404).send();
    return;
  }
  const foreignAuthor = await Author.findByPk(req.params.foreign_author_id);
  if (foreignAuthor === null) {
    res.status(404).send();
    return;
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

export {
  addFollower,
  checkFollower,
  getAuthorFollowers,
  getAuthorFollowings,
  removeFollower,
};
