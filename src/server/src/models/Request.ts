import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import Author from './Author';

class Request extends Model {
  declare authorId: typeof uuidv4;
  declare requestId: typeof uuidv4;
  declare author: Author;
  static Author: BelongsTo;
}

Request.init(
  {
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Request',
    underscored: true,
  }
);

export default Request;
