import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import Author from './Author';
import Post from './Post';

export default class PostLike extends Model {
  declare id: number;
  declare authorId: string;
  declare author: Author;
  declare postId: string;
  declare post: Post;
  declare createdAt: Date;
  static Post: BelongsTo;
}

PostLike.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { sequelize: db }
);
