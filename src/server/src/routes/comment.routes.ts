import { body, param } from 'express-validator';
import express from 'express';

const router = express.Router({ mergeParams: true });

import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { requiredLoggedIn } from '../middlewares/auth.middlewares';

import {
  createComment,
  getComment,
  getComments,
  getCommentLikes,
} from '../controllers/comment.controllers';

router.get('/', [paginate, validate([param('postId').isUUID()])], getComments);

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

router.get('/:commentId', [
  validate([param('postId').isUUID(), param('commentId').isUUID()]),
  getComment,
]);

router.get('/:commentId/likes', [
  validate([param('postId').isUUID(), param('commentId').isUUID()]),
  getCommentLikes,
]);

export default router;
