import { BelongsTo, DataTypes, Model } from 'sequelize';
import Author from './Author';
import Comment from './Comment';
import CommentLike from './CommentLike';
import Post from './Post';
import PostLike from './PostLike';
import FollowRequest from './FollowRequest';
import db from '../db';

export default class InboxItem extends Model {
  declare id: number;
  declare recipient: Author;
  declare post?: Post;
  declare comment?: Comment;
  declare commentLike?: CommentLike;
  declare postLike?: PostLike;
  declare request?: FollowRequest;
  declare createdAt: Date;
  static Recipient: BelongsTo;
}

InboxItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    sequelize: db,
  }
);

InboxItem.belongsTo(Author, { as: 'recipient' });
InboxItem.belongsTo(Post, { as: 'post' });
InboxItem.belongsTo(Comment, { as: 'comment' });
InboxItem.belongsTo(PostLike, { as: 'postLike' });
InboxItem.belongsTo(CommentLike, { as: 'commentLike' });
InboxItem.belongsTo(FollowRequest, { as: 'request' });
