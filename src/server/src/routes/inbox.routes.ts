import { Router } from 'express';
import { body, CustomValidator, oneOf } from 'express-validator';
import { requiredLoggedIn } from '../middlewares/auth.middlewares';
import {
  getInbox,
  sendToInbox,
  clearInbox,
} from '../controllers/inbox.controllers';
import { paginate } from '../middlewares/pagination.middlewares';
import { postValidations } from './post.routes';

const stringEqualsCaseInsensitive: (target: string) => CustomValidator = (
  target: string
) => {
  return (value) =>
    typeof value === 'string' && value.toLowerCase() === target.toLowerCase();
};

const router = Router({ mergeParams: true });

router.get('/', [requiredLoggedIn, paginate], getInbox);

router.post(
  '/',
  [
    oneOf([
      [
        body('type').custom(stringEqualsCaseInsensitive('post')),
        ...postValidations,
      ],
      [
        body('type').custom(stringEqualsCaseInsensitive('follow')),
        body('actor.id').isURL(),
      ],
      [
        body('type').custom(stringEqualsCaseInsensitive('like')),
        body('object.id').isURL(),
      ],
    ]),
  ],
  sendToInbox
);

router.delete('/', [requiredLoggedIn], clearInbox);

export default router;
