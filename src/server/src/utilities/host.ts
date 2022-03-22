import { Request } from 'express';

const getHost = (req: Request): string => {
  return req.protocol + '://' + req.get('host');
};

export { getHost };
