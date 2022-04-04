import { Request } from 'express';
import FollowRequest from '../models/Request';
import { serializeAuthor } from '../serializers/author.serializers';

export const serializeFollowRequest = async (
  followRequest: FollowRequest,
  req: Request
): Promise<Record<string, unknown>> => {
  return {
    type: 'Follow',
    actor: await serializeAuthor(followRequest.requestor, req),
    object: await serializeAuthor(followRequest.author, req),
  };
};
