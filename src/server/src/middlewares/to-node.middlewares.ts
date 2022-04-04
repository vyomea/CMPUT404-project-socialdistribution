import axios from 'axios';
import { NextFunction, Response } from 'express';
import Node from '../models/Node';
import { remoteRequestConfig } from '../utilities/remote-request-config';
import { getHost } from '../utilities/host';
import { ToNodeRequest } from '../types/auth';

const forwardRequestToRemoteNode = async (
  req: ToNodeRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.method !== 'GET') {
    res.status(405).send({
      error:
        'Request forwarding to remote nodes is only suitable for GET requests',
    });
    return;
  }

  if (
    !req.query.node ||
    (typeof req.query.node === 'string' &&
      new URL(req.query.node).host === new URL(getHost(req)).host)
  ) {
    next();
    return;
  }

  const node = await Node.findOne({ where: { serviceUrl: req.query.node } });
  if (node === null) {
    res.status(400).send({ error: 'That node is invalid or unknown' });
    return;
  }
  req.requestType = 'toNode';
  req.toNode = node;

  try {
    res
      .status(200)
      .send(
        (
          await axios.get(
            req.originalUrl.replace(/node=[^%]*/, ''),
            remoteRequestConfig(req.toNode)
          )
        ).data
      );
  } catch (e) {
    console.error(e);
    res.status(502).send();
  }
};

const setToNodeOnRequest = async (
  req: ToNodeRequest,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.query.node ||
    (typeof req.query.node === 'string' &&
      new URL(req.query.node).host === new URL(getHost(req)).host)
  ) {
    next();
    return;
  }

  const node = await Node.findOne({ where: { serviceUrl: req.query.node } });
  if (node === null) {
    res.status(400).send({ error: 'That node is invalid or unknown' });
    return;
  }
  req.requestType = 'toNode';
  req.toNode = node;
  delete req.query.node;

  next();
};

export { forwardRequestToRemoteNode, setToNodeOnRequest };
