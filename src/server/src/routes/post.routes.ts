import { body, param } from 'express-validator';
import express from 'express';
import multer from 'multer';
const router = express.Router({ mergeParams: true });

import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { requiredLoggedIn } from '../middlewares/auth.middlewares';
import { forwardRequestToRemoteNode } from '../middlewares/to-node.middlewares';

import {
  createPost,
  deleteAuthorPost,
  getAuthorPost,
  getAuthorPosts,
  getPostImage,
  updateAuthorPost,
  getPostLikes,
} from '../controllers/post.controllers';

export const postValidations = [
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
];

router.get(
  '/:postId',
  validate([param('postId').isUUID()]),
  forwardRequestToRemoteNode,
  getAuthorPost
);
router.get(
  '/:postId/image',
  validate([param('postId').isUUID()]),
  forwardRequestToRemoteNode,
  getPostImage
);
router.post(
  '/:postId',
  [
    requiredLoggedIn,
    multer().single('image'),
    validate([
      param('postId').isUUID(),
      ...postValidations.map((validation) => validation.optional()),
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
    validate([param('postId').isUUID(), ...postValidations]),
  ],
  createPost
);
router.get('/', paginate, forwardRequestToRemoteNode, getAuthorPosts);
router.post(
  '/',
  [requiredLoggedIn, multer().single('image'), validate([...postValidations])],
  createPost
);

router.get(
  '/:postId/likes',
  validate([param('postId').isUUID()]),
  forwardRequestToRemoteNode,
  getPostLikes
);

export default router;
