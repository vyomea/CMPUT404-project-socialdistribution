import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Author from './Author';
import Post from './Post';

class Comment extends Model {
  static Author: BelongsTo;
  declare author: Author;
  static Post: BelongsTo;
  declare post: Post;
  declare comment: string;
  declare contentType: 'text/markdown' | 'text/plain';
  declare published: Date;
  declare id: typeof uuidv4;
}

Comment.init(
  {
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'text/plain',
      validate: {
        customValidator: (value) => {
          const enums = ['text/markdown', 'text/plain'];
          if (!enums.includes(value)) {
            throw new Error('Not a valid option');
          }
        },
      },
    },
    published: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Comment',
    underscored: true,
  }
);

export default Comment;
