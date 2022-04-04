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
  const serializeLocalAuthorData = () => ({
    type: 'author',
    ...pick(author.toJSON(), authorPublicAttributes),
    id: `${getHost(req)}/authors/${author.id}`,
    url: `${getHost(req)}/authors/${author.id}`,
    host: `${getHost(req)}/`,
  });

  if (!author.nodeServiceUrl) {
    // Local author
    return serializeLocalAuthorData();
  } else {
    const node = await Node.findByPk(author.nodeServiceUrl);
    // Remote author
    try {
      return (
        await axios.get(`/authors/${author.id}`, remoteRequestConfig(node))
      ).data;
    } catch (e) {
      console.error(e);
      return serializeLocalAuthorData();
    }
  }
};
