import { Response } from 'express';
import argon2 from 'argon2';
import Node from '../models/Node';
import { AuthenticatedRequest } from '../types/auth';
import Author from '../models/Author';
import { pick } from '../utilities/pick';

const addOrUpdateNode = async (req: AuthenticatedRequest, res: Response) => {
  const serviceUrl = req.params.serviceUrl;
  const {
    incomingUsername,
    incomingPassword,
    outgoingUsername,
    outgoingPassword,
  } = req.body;
  await Node.upsert({
    serviceUrl,
    incomingUsername,
    incomingPasswordHash: await argon2.hash(incomingPassword),
    outgoingUsername,
    outgoingPassword,
  });
  res.status(200).send();
};

const getAllNodes = async (req: AuthenticatedRequest, res: Response) => {
  let requestingAuthor: Author;
  if (req.authorId) requestingAuthor = await Author.findByPk(req.authorId);

  const nodes = await Node.findAll();
  res
    .status(200)
    .json(
      nodes.map((node) =>
        pick(node.toJSON(), [
          'serviceUrl',
          'incomingUsername',
          ...(requestingAuthor?.isAdmin
            ? ['outgoingUsername', 'outgoingPassword']
            : []),
        ])
      )
    );
};

const removeNode = async (req: AuthenticatedRequest, res: Response) => {
  const node = await Node.findOne({
    where: { serviceUrl: req.params.serviceUrl },
  });
  if (node === null) {
    res.status(404).send();
    return;
  }
  try {
    await node.destroy();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

export { addOrUpdateNode, getAllNodes, removeNode };
