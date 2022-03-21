import express from 'express';
import { body, param } from 'express-validator';
const router = express.Router();

import { validate } from '../middlewares/validator.middlewares';

import { addNode, removeNode } from '../controllers/node.controllers';
import { adminOnly } from '../middlewares/auth.middlewares';

router.post(
  '/',
  [
    adminOnly,
    validate([body('username').isString(), body('password').isString()]),
  ],
  addNode
);

router.delete(
  '/:node_id',
  [adminOnly, validate([param('node_id').isString()])],
  removeNode
);

export default router;