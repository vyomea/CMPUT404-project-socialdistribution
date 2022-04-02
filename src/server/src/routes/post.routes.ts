import { body, param } from 'express-validator';
import express from 'express';
import multer from 'multer';
const router = express.Router({ mergeParams: true });

import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { requiredLoggedIn } from '../middlewares/auth.middlewares';

import {
  createPost,
  deleteAuthorPost,
  getAuthorPost,
  getAuthorPosts,
  getPostImage,
  updateAuthorPost,
} from '../controllers/post.controllers';

router.get('/:postId', validate([param('postId').isUUID()]), getAuthorPost);
router.get(
  '/:postId/image',
  validate([param('postId').isUUID()]),
  getPostImage
);
router.post(
  '/:postId',
  [
    requiredLoggedIn,
    multer().single('image'),
    validate([
      param('postId').isUUID(),
      body('title').isString().optional(),
      body('description').isString().optional(),
      body('source').isURL().optional(),
      body('origin').isURL().optional(),
      body('contentType')
        .isIn(['text/markdown', 'text/plain', 'application/base64', 'image'])
        .optional(),
      body('content').optional(),
      body('categories.*').isString().optional(),
      body('visibility').isIn(['PUBLIC', 'FRIENDS']).optional(),
    ]),
  ],
  updateAuthorPost
);
router.delete(
  '/:postId',
  [requiredLoggedIn, validate([param('postId').isUUID()])],
  deleteAuthorPost
);
router.put(
  '/:postId',
  [
    requiredLoggedIn,
    multer().single('image'),
    validate([
      param('postId').isUUID(),
      body('title').isString(),
      body('description').isString(),
      body('source').isURL(),
      body('origin').isURL(),
      body('contentType').isIn([
        'text/markdown',
        'text/plain',
        'application/base64',
        'image',
      ]),
      body('content').optional(),
      body('categories.*').isString(),
      body('visibility').isIn(['PUBLIC', 'FRIENDS']),
    ]),
  ],
  createPost
);
router.get('/', paginate, getAuthorPosts);
router.post(
  '/',
  [
    requiredLoggedIn,
    multer().single('image'),
    validate([
      body('title').isString(),
      body('description').isString(),
      body('source').isURL(),
      body('origin').isURL(),
      body('contentType').isIn([
        'text/markdown',
        'text/plain',
        'application/base64',
        'image',
      ]),
      body('content').optional(),
      body('categories.*').isString(),
      body('visibility').isIn(['PUBLIC', 'FRIENDS']),
    ]),
  ],
  createPost
);

export default router;
