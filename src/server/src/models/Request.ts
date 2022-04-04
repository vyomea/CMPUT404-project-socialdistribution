import { BelongsTo, DataTypes, Model } from 'sequelize';
import db from '../db';
import Author from './Author';

class Request extends Model {
  declare id: number;
  declare authorId: string;
  declare requestId: string;
  declare author: Author;
  declare requestor: Author;
  static Author: BelongsTo;
  static Requestor: BelongsTo;
}

Request.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: 'author_requester',
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: 'author_requester',
    },
  },
  {
    sequelize: db,
    modelName: 'Request',
    underscored: true,
  }
);

export default Request;
