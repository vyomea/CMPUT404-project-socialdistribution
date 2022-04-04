import express from 'express';
import Node from '../models/Node';

type NodeAuthenticatedRequest = express.Request & {
  requesterType: 'node';
  node: Node;
};

type NodeAuthenticatedRequestHandler = (
  req: NodeAuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => void;

type AuthenticatedRequest = express.Request & {
  requesterType: 'author';
  authorId: string;
};

type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => void;

interface JwtPayload {
  authorId: string;
}

export {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
  NodeAuthenticatedRequest,
  NodeAuthenticatedRequestHandler,
  JwtPayload,
};
