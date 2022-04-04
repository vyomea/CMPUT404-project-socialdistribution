import axios from 'axios';
import { Request } from 'express';
import Author from '../models/Author';
import { getHost } from '../utilities/host';
import { pick } from '../utilities/pick';
import { remoteRequestConfig } from '../utilities/remote-request-config';
import Node from '../models/Node';

export const authorPublicAttributes = [
  'id',
  'displayName',
  'github',
  'profileImage',
  'isAdmin',
  'verified',
];

export const serializeAuthor = async (
  author: Author,
  req: Request
): Promise<Record<string, unknown>> => {
  if (!author.nodeServiceUrl) {
    // Local author
    return {
      type: 'author',
      ...pick(author.toJSON(), authorPublicAttributes),
      id: `${getHost(req)}/authors/${author.id}`,
      url: `${getHost(req)}/authors/${author.id}`,
      host: `${getHost(req)}/`,
    };
  } else {
    const node = await Node.findByPk(author.nodeServiceUrl);
    // Remote author
    return (await axios.get(`/authors/${author.id}`, remoteRequestConfig(node)))
      .data;
  }
};
