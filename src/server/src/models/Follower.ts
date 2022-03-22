import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Author from './Author';

class Follower extends Model {
  declare authorId: typeof uuidv4;
  declare followerId: typeof uuidv4;
  declare author: Author;
  static Author: BelongsTo;
}

Follower.init(
  {
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Follower',
    underscored: true,
  }
);

export default Follower;
