import { body, param } from 'express-validator';
import express from 'express';
const router = express.Router();

import { adminOnly, requiredLoggedIn } from '../middlewares/auth.middlewares';
import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';

import posts from './post.routes';
import comments from './comment.routes';
import followers from './follower.routes';

import {
  deleteAuthor,
  getAllAuthors,
  getAuthor,
  getCurrentAuthor,
  updateProfile,
} from '../controllers/author.controllers';
import { getAuthorFollowings } from '../controllers/follower.controllers';

router.use(
  '/:id/posts/:post_id/comments',
  validate([param('id').isUUID(), param('post_id').isUUID()]),
  comments
);
router.use('/:id/posts', validate([param('id').isUUID()]), posts);
router.use('/:id/followers', validate([param('id').isUUID()]), followers);
router.use(
  '/:id/following',
  validate([param('id').isUUID()]),
  getAuthorFollowings
);

router.get('/', paginate, getAllAuthors);
router.get('/me', requiredLoggedIn, getCurrentAuthor);
router.delete(
  '/:id',
  [adminOnly, validate([param('id').isUUID()])],
  deleteAuthor
);
router.get('/:id', validate([param('id').isUUID()]), getAuthor);
router.post(
  '/:id',
  [
    requiredLoggedIn,
    validate([
      param('id').isUUID(),
      body('email').isEmail().optional(),
      body('displayName').isString().optional(),
      body('github').isURL().optional(),
      body('profileImage').isURL().optional(),
      body('verified').isBoolean().optional(),
    ]),
  ],
  updateProfile
);

export default router;
