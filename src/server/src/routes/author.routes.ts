import { body, param } from 'express-validator';
import express from 'express';
const router = express.Router();

import { requiredLoggedIn } from '../middlewares/auth.middlewares';
import { paginate } from '../middlewares/pagination.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { adminOnly } from '../middlewares/auth.middlewares';

import posts from './post.routes';
import followers from './follower.routes';

import {
  getAllAuthors,
  getAuthor,
  getCurrentAuthor,
  updateProfile,
  deleteAuthor
} from '../controllers/author.controllers';

router.use('/:id/posts', validate([param('id').isUUID()]), posts);
router.use('/:id/followers', validate([param('id').isUUID()]), followers);

router.get('/', paginate, getAllAuthors);
router.get('/me', requiredLoggedIn, getCurrentAuthor);
router.get('/:id', validate([param('id').isUUID()]), getAuthor);
router.post(
  '/:id',
  validate([
    param('id').isUUID(),
    body('email').isEmail().optional(),
    body('displayName').isString().optional(),
    body('github').isURL().optional(),
    body('profileImage').isURL().optional(),
    body('isAdmin').isBoolean().optional(),
  ]),
  updateProfile
);
router.delete('/:id', adminOnly, validate([param('id').isUUID()]), deleteAuthor);

export default router;
