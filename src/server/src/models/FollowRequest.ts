import { BelongsTo, DataTypes, Model } from 'sequelize';
import Author from './Author';
import db from '../db';

export default class FollowRequest extends Model {
  declare id: number;
  declare requestee: Author;
  declare requesteeId: string;
  declare requester: Author;
  declare requesterId: string;
  static Requester: BelongsTo;
  static Requestee: BelongsTo;
}

FollowRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  { sequelize: db }
);
