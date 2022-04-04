import { BelongsTo, DataTypes, Model } from 'sequelize';
import Author from './Author';
import Comment from './Comment';
import CommentLike from './CommentLike';
import Post from './Post';
import PostLike from './PostLike';
import Request from './Request';
import db from '../db';

export default class InboxItem extends Model {
  declare id: number;
  declare recipient: Author;
  declare post?: Post;
  declare comment?: Comment;
  declare commentLike?: CommentLike;
  declare postLike?: PostLike;
  declare followRequest?: Request;
  declare createdAt: Date;
  static Recipient: BelongsTo;
}

InboxItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    modelName: 'InboxItem',
    sequelize: db,
  }
);

InboxItem.belongsTo(Author, { as: 'recipient' });
InboxItem.hasOne(Post, { as: 'post' });
InboxItem.hasOne(Comment, { as: 'comment' });
InboxItem.hasOne(PostLike, { as: 'postLike' });
InboxItem.hasOne(CommentLike, { as: 'commentLike' });
InboxItem.hasOne(Request, { as: 'followRequest' });
