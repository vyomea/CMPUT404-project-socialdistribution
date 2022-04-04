import express from 'express';
import { param } from 'express-validator';
const router = express.Router({ mergeParams: true });

import { requiredLoggedIn } from '../middlewares/auth.middlewares';
import { validate } from '../middlewares/validator.middlewares';
import { forwardRequestToRemoteNode } from '../middlewares/to-node.middlewares';

import {
  addFollower,
  checkFollower,
  getAuthorFollowers,
  removeFollower,
} from '../controllers/follower.controllers';

router.get('/', forwardRequestToRemoteNode, getAuthorFollowers);

router.get(
  '/:foreign_author_id',
  validate([param('foreign_author_id').isUUID()]),
  forwardRequestToRemoteNode,
  checkFollower
);
router.delete(
  '/:foreign_author_id',
  validate([param('foreign_author_id').isUUID()]),
  removeFollower
);
router.put(
  '/:foreign_author_id',
  [requiredLoggedIn, validate([param('foreign_author_id').isUUID()])],
  addFollower
);

export default router;
