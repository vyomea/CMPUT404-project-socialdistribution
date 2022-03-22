import { Response } from 'express';
import argon2 from 'argon2';
import Node from '../models/Node';
import { AuthenticatedRequest } from '../types/auth';

const addNode = async (req: AuthenticatedRequest, res: Response) => {
  const { username, password } = req.body;
  const nodeExists = await Node.findOne({
    where: {
      username: username,
    },
  });
  if (nodeExists !== null) {
    res.status(400).send({ error: 'Node already exists' });
    return;
  }
  const passwordHash = await argon2.hash(password);
  try {
    await Node.create({
      username: username,
      passwordHash: passwordHash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error });
    return;
  }
  res.status(200).send();
};

const getAllNodes = async (req: AuthenticatedRequest, res: Response) => {
  const nodes = await Node.findAll();
  res.send(nodes);
};

const removeNode = async (req: AuthenticatedRequest, res: Response) => {
  const node = await Node.findOne({
    where: { id: req.params.node_id },
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

export { addNode, getAllNodes, removeNode };
