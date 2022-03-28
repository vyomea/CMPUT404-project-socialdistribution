import { Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import Author from '../models/Author';
import { JwtPayload } from '../types/auth';
import Node from '../models/Node';

const loginUser = async (
  author: Author,
  password: string,
  res: Response
): Promise<void> => {
  const passwordIsCorrect = await argon2.verify(author.passwordHash, password);
  if (!passwordIsCorrect) {
    unauthorized(res);
    return;
  }
  const payload: JwtPayload = { authorId: author.id.toString() };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  res.json({ token, author });
};

const unauthorized = (res: Response): void => {
  res.setHeader('WWW-Authenticate', 'Bearer');
  res.status(401).send();
};

const validNode = async (username: string, password: string) => {
  const node = await Node.findOne({
    where: {
      username: username,
    },
  });
  if (node === null) {
    return false;
  }
  const passwordIsCorrect = await argon2.verify(node.passwordHash, password);
  if (!passwordIsCorrect) {
    return false;
  }
  return true;
};

export { loginUser, unauthorized, validNode };
