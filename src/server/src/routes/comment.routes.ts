import { body, param } from 'express-validator';
import express from 'express';

const router = express.Router({ mergeParams: true });

import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { requiredLoggedIn } from '../middlewares/auth.middlewares';

import {
    createComment,
    getPostComment,
    getPostComments,
} from '../controllers/comment.controllers';

router.get('/:comment_id', validate([param('comment_id').isUUID()]), getPostComment);

router.post(
  '/:post_id',
  [
    requiredLoggedIn,
    validate([
      param('comment_id').isUUID(),
      body('comment').isString(),
      body('contentType').isIn([
        'text/markdown',
        'text/plain',
      ]),
    ]),
  ],
  createComment
);
router.get('/', paginate, getPostComments);

export default router;
