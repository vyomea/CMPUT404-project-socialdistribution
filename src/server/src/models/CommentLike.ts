import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import Author from './Author';
import Comment from './Comment';

export default class CommentLike extends Model {
  declare id: number;
  declare authorId: string;
  declare author: Author;
  declare commentId: string;
  declare comment: Comment;
  declare createdAt: Date;
  static Comment: BelongsTo;
}

CommentLike.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { sequelize: db }
);
