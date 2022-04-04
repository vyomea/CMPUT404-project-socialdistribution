import express from 'express';
import { body, param } from 'express-validator';
const router = express.Router();

import { validate } from '../middlewares/validator.middlewares';

import {
  addOrUpdateNode,
  getAllNodes,
  removeNode,
} from '../controllers/node.controllers';
import { adminOnly } from '../middlewares/auth.middlewares';

router.get('/', adminOnly, getAllNodes);

const nodeValidations = [
  body('incomingUsername').isString().notEmpty(),
  body('incomingPassword').isString().notEmpty(),
  body('outgoingUsername').isString().notEmpty(),
  body('outgoingPassword').isString().notEmpty(),
];

router.post(
  '/:serviceUrl',
  [adminOnly, validate([param('serviceUrl').isString(), ...nodeValidations])],
  addOrUpdateNode
);

router.delete(
  '/:serviceUrl',
  [adminOnly, validate([param('serviceUrl').isString()])],
  removeNode
);

export default router;
