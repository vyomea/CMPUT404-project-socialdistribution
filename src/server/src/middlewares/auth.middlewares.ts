import { NextFunction, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized, validNode } from '../handlers/auth.handlers';
import Author from '../models/Author';
import { AuthenticatedRequest, JwtPayload } from '../types/auth';

const adminOnly: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.authorId) {
    unauthorized(res);
    return;
  }
  const author = await Author.findOne({
    where: {
      id: req.authorId,
    },
  });
  if (author === null || !author.isAdmin) {
    unauthorized(res);
    return;
  }
  next();
};

/**
 * Adds `authorId` to the request based on the request Authorization header.
 */
const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  const authHeader = req.headers.authorization;
  const authType = authHeader && authHeader.split(' ')[0];
  const encodedData = authHeader && authHeader.split(' ')[1];
  if (authType === 'Basic' && encodedData) {
    const [username, password] = Buffer.from(encodedData, 'base64')
      .toString()
      .split(':');
    if (!(await validNode(username, password))) {
      unauthorized(res);
      return;
    }
  }
  if (authType === 'Bearer' && encodedData) {
    jwt.verify(
      encodedData,
      process.env.JWT_SECRET,
      (err, payload: JwtPayload) => {
        if (!err && payload) {
          req.authorId = payload.authorId;
        } else {
          unauthorized(res);
          return;
        }
      }
    );
  }
  next();
};

/**
 * Requires an author to be logged in.
 *
 * If the author is logged in, the request is passed on.
 * Otherwise, an HTTP 400 response is sent.
 *
 * @param handler the handler to use if the request is authenticated
 */

const requiredLoggedIn: RequestHandler = (
  req: AuthenticatedRequest,
  res,
  next
) => {
  if (!req.authorId) {
    unauthorized(res);
    return;
  }
  next();
};

export { adminOnly, authenticate, requiredLoggedIn };
