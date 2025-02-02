import { BelongsTo, DataTypes, HasMany, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Author from './Author';
import Comment from './Comment';
import Node from './Node';
import PostLike from './PostLike';

class Post extends Model {
  declare id: typeof uuidv4;
  declare title: string;
  declare source: string;
  declare origin: string;
  declare description: string;
  declare contentType:
    | 'text/markdown'
    | 'text/plain'
    | 'application/base64'
    | 'image/png;base64'
    | 'image/jpeg;base64';
  declare content: string;
  declare image: Blob;
  declare categories: string[];
  declare count: number;
  declare published: Date;
  declare visibility: 'PUBLIC' | 'FRIENDS';
  declare unlisted: boolean;
  declare authorId: string;
  static Author: BelongsTo;
  declare author: Author;
  static Comments: HasMany;
  declare comments: Comment[];
  declare addComment: (comment: Comment) => void;
  static Node: BelongsTo;
  declare node: Node;
  declare nodeServiceUrl: string;
  static Likes: HasMany;
  declare likes: PostLike[];
  declare getNode: () => Promise<Node>;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'text/plain',
      validate: {
        customValidator: (value) => {
          const enums = [
            'text/markdown',
            'text/plain',
            'application/base64',
            'image/png;base64',
            'image/jpeg;base64',
          ];
          if (!enums.includes(value)) {
            throw new Error('Not a valid option');
          }
        },
      },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB(),
      allowNull: true,
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    published: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'PUBLIC',
      validate: {
        customValidator: (value) => {
          const enums = ['PUBLIC', 'FRIENDS'];
          if (!enums.includes(value)) {
            throw new Error('Not a valid option');
          }
        },
      },
    },
    unlisted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Post',
    underscored: true,
  }
);

Post.Comments = Post.hasMany(Comment, { as: 'comments' });
Comment.Post = Comment.belongsTo(Post, { as: 'post' });

Post.Node = Post.belongsTo(Node, { as: 'node' });
Node.Posts = Node.hasMany(Post, { as: 'posts' });

Post.Likes = Post.hasMany(PostLike, { as: 'likes' });
PostLike.Post = PostLike.belongsTo(Post, { as: 'post' });

export default Post;
