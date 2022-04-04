import { body, param } from 'express-validator';
import express from 'express';
const router = express.Router();

import { adminOnly, requiredLoggedIn } from '../middlewares/auth.middlewares';
import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';

import posts from './post.routes';
import comments from './comment.routes';
import followers from './follower.routes';
import inbox from './inbox.routes';

import {
  deleteAuthor,
  getAllAuthors,
  getAuthor,
  getAuthorLiked,
  getCurrentAuthor,
  updateProfile,
} from '../controllers/author.controllers';
import { getAuthorFollowings } from '../controllers/follower.controllers';

router.use(
  '/:authorId/posts/:postId/comments',
  validate([param('authorId').isUUID(), param('postId').isUUID()]),
  comments
);
router.use('/:authorId/posts', validate([param('authorId').isUUID()]), posts);
router.use(
  '/:authorId/followers',
  validate([param('authorId').isUUID()]),
  followers
);
router.use(
  '/:authorId/following',
  validate([param('authorId').isUUID()]),
  getAuthorFollowings
);

router.use('/:authorId/inbox', inbox);

router.get('/:authorId/liked', getAuthorLiked);

router.get('/', paginate, getAllAuthors);
router.get('/me', requiredLoggedIn, getCurrentAuthor);
router.delete(
  '/:authorId',
  [adminOnly, validate([param('authorId').isUUID()])],
  deleteAuthor
);
router.get('/:authorId', validate([param('authorId').isUUID()]), getAuthor);
router.post(
  '/:authorId',
  validate([
    param('authorId').isUUID(),
    body('email').isEmail().optional(),
    body('displayName').isString().optional(),
    body('github').isURL().optional(),
    body('profileImage').isURL().optional(),
  ]),
  updateProfile
);

export default router;
