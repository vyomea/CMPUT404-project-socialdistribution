import { body, param } from 'express-validator';
import express from 'express';

const router = express.Router({ mergeParams: true });

import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { requiredLoggedIn } from '../middlewares/auth.middlewares';

import {
  createComment,
  getPostComments,
} from '../controllers/comment.controllers';

router.get(
  '/',
  [paginate, validate([param('postId').isUUID()])],
  getPostComments
);

router.post(
  '/',
  [
    requiredLoggedIn,
    validate([
      body('comment').isString(),
      body('contentType').isIn(['text/markdown', 'text/plain']),
    ]),
  ],
  createComment
);

export default router;
