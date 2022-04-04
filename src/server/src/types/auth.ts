import express from 'express';
import Node from '../models/Node';

/**
 * A request that originates from a local authenticated author.
 */
export type AuthenticatedRequest = express.Request & {
  requestType: 'author';
  authorId: string;
};

/**
 * A request that originates from a local author, possibly unauthenticated.
 * `toNode` is the node that the request should be forwarded to.
 */
export type ToNodeRequest = express.Request & {
  requestType: 'toNode';
  authorId?: string;
  toNode: Node;
};

/**
 * A request that originates from a remote node.
 */
export type FromNodeRequest = express.Request & {
  requestType: 'fromNode';
  fromNode: Node;
};

export interface JwtPayload {
  authorId: string;
}
