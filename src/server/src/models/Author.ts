import { BelongsTo, DataTypes, HasMany, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Post from './Post';
import Comment from './Comment';
import Follower from './Follower';
import Request from './Request';
import Node from './Node';

class Author extends Model {
  declare id: typeof uuidv4;
  declare email: string;
  declare passwordHash: string;
  declare displayName: string;
  declare github: string;
  declare profileImage: string;
  declare isAdmin: boolean;
  declare verified: boolean;
  declare serviceUrl: string;
  static Posts: HasMany;
  static Comments: HasMany;
  static Followers: HasMany;
  static Requests: HasMany;
  static Node: BelongsTo;
  declare followers: Follower[];
  declare posts: Post[];
  declare requests: Request[];
  declare node: Node[];
  declare addComment: (comment: Comment) => Promise<void>;
  declare addPost: (post: Post) => Promise<void>;
  declare addFollower: (author: Author) => Promise<void>;
  declare hasFollower: (author: Author) => Promise<boolean>;
  declare removeFollower: (author: Author) => Promise<void>;
  declare addRequest: (author: Author) => Promise<void>;
  declare hasRequest: (author: Author) => Promise<boolean>;
  declare removeRequest: (author: Author) => Promise<void>;
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
      allowNull: true,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: true,
      defaultValue: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    serviceUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Node,
        key: 'serviceUrl',
      },
    },
  },
  {
    sequelize: db,
    modelName: 'Author',
    underscored: true,
  }
);

Author.Posts = Author.hasMany(Post, { onDelete: 'cascade', hooks: true });
Post.Author = Post.belongsTo(Author, { as: 'author' });

Author.Followers = Author.belongsToMany(Author, {
  through: 'followers',
  as: 'follower',
});
Follower.Follower = Follower.belongsTo(Author, {
  as: 'follower',
  foreignKey: 'followerId',
});
Follower.Author = Follower.belongsTo(Author, {
  as: 'author',
  foreignKey: 'authorId',
});

Author.Requests = Author.belongsToMany(Author, {
  through: 'requests',
  as: 'request',
});
Request.Author = Request.belongsTo(Author, {
  as: 'author',
  foreignKey: 'authorId',
});
Request.Requestor = Request.belongsTo(Author, {
  as: 'requestor',
  foreignKey: 'requestId',
});

Author.Comments = Author.hasMany(Comment);
Comment.Author = Comment.belongsTo(Author, { as: 'author' });

Author.Node = Author.belongsTo(Node, { as: 'node' });

export default Author;
