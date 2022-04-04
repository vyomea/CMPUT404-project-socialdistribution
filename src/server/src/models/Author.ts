import { BelongsTo, DataTypes, HasMany, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Post from './Post';
import Comment from './Comment';
import Follower from './Follower';
import Node from './Node';
import CommentLike from './CommentLike';
import PostLike from './PostLike';
import FollowRequest from './FollowRequest';

class Author extends Model {
  declare id: typeof uuidv4;
  declare email: string;
  declare passwordHash: string;
  declare displayName: string;
  declare github: string;
  declare profileImage: string;
  declare isAdmin: boolean;
  declare verified: boolean;
  static Posts: HasMany;
  static Comments: HasMany;
  static Followers: HasMany;
  static Node: BelongsTo;
  static CommentLikes: HasMany;
  static PostLikes: HasMany;
  declare followers: Follower[];
  declare posts: Post[];
  declare outgoingFollowRequests: FollowRequest[];
  declare incomingFollowRequests: FollowRequest[];
  declare node: Node;
  declare nodeServiceUrl: string;
  declare commentLikes: CommentLike[];
  declare postLikes: PostLike[];
  declare addComment: (comment: Comment) => Promise<void>;
  declare addPost: (post: Post) => Promise<void>;
  declare addFollower: (author: Author) => Promise<void>;
  declare hasFollower: (author: Author) => Promise<boolean>;
  declare removeFollower: (author: Author) => Promise<void>;
  declare getNode: () => Promise<Node>;
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

Author.hasMany(FollowRequest, { as: 'outgoingFollowRequests' });
Author.hasMany(FollowRequest, { as: 'incomingFollowRequests' });
FollowRequest.belongsTo(Author, { as: 'requestee' });
FollowRequest.belongsTo(Author, { as: 'requester' });

Author.Comments = Author.hasMany(Comment);
Comment.Author = Comment.belongsTo(Author, { as: 'author' });

Author.Node = Author.belongsTo(Node, { as: 'node' });
Node.Authors = Node.hasMany(Author, { as: 'authors' });

Author.PostLikes = Author.hasMany(PostLike, { as: 'postLikes' });
PostLike.Author = PostLike.belongsTo(Author, { as: 'author' });
Author.CommentLikes = Author.hasMany(CommentLike, { as: 'commentLikes' });
CommentLike.Author = CommentLike.belongsTo(Author, { as: 'author' });

export default Author;
