import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import Author from '../models/Author';
import { JwtPayload } from '../types/auth';
import Node from '../models/Node';
import { serializeAuthor } from '../serializers/author.serializers';

const loginUser = async (
  author: Author,
  password: string,
  req: Request,
  res: Response
): Promise<void> => {
  const passwordIsCorrect = await argon2.verify(author.passwordHash, password);
  if (!passwordIsCorrect) {
    unauthorized(res);
    return;
  }
  const payload: JwtPayload = { authorId: author.id.toString() };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  res.json({ token, author: await serializeAuthor(author, req) });
};

const unauthorized = (res: Response, authorizationType = 'Bearer'): void => {
  res.setHeader('WWW-Authenticate', authorizationType);
  res.status(401).send();
};

const findNode = async (username: string, password: string) => {
  const node = await Node.findOne({
    where: {
      username: username,
    },
  });
  if (node === null) {
    return null;
  }
  const passwordIsCorrect = await argon2.verify(
    node.incomingPasswordHash,
    password
  );
  if (!passwordIsCorrect) {
    return null;
  }
  return node;
};

export { loginUser, unauthorized, findNode };
