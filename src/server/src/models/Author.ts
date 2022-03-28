import { DataTypes, HasMany, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Post from './Post';
import Comment from './Comment';

class Author extends Model {
  declare id: typeof uuidv4;
  declare email: string;
  declare passwordHash: string;
  declare displayName: string;
  declare github: string;
  declare profileImage: string;
  declare isAdmin: boolean;
  static Posts: HasMany;
  static Comments: HasMany;
  declare addPost: (post: Post) => void;
}

Author.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    github: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Author',
    underscored: true,
  }
);

Author.Posts = Author.hasMany(Post);
Post.Author = Post.belongsTo(Author, { as: 'author' });

Author.Comments = Author.hasMany(Comment);
Comment.Author = Comment.belongsTo(Author, { as: 'author' });

export default Author;
