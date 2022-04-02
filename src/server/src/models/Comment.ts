import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Author from './Author';
import Post from './Post';

class Comment extends Model {
  declare id: typeof uuidv4;
  declare comment: string;
  declare contentType: 'text/markdown' | 'text/plain';
  declare published: Date;
  static Author: BelongsTo;
  declare author: Author;
  static Post: BelongsTo;
  declare post: Post;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false,
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
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    modelName: 'Comment',
    underscored: true,
  }
);

export default Comment;
