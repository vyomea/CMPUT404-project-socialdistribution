import { NextFunction, Response } from 'express';
import { PaginationRequest } from '../types/pagination';

const paginate = (
  req: PaginationRequest,
  res: Response,
  next: NextFunction
) => {
  let page = 1;
  let size = 10;

  if (req.query.size) {
    size = parseInt(req.query.size.toString());
    if (isNaN(size) || size < 1) {
      res.status(400).send({ error: 'size must be a positive integer' });
      return;
    }
  }

  if (req.query.page) {
    page = parseInt(req.query.page.toString());
    if (isNaN(page) || page < 1) {
      res.status(400).send({ error: 'page must be a positive integer' });
      return;
    }
  }

  req.limit = size;
  req.offset = (page - 1) * req.limit;
  next();
};

export { paginate };
