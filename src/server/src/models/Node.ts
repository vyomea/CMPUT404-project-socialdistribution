import { DataTypes, Model } from 'sequelize';
import db from '../db';

class Node extends Model {
  declare serviceUrl: string;
  declare incomingUsername: string;
  declare incomingPasswordHash: string;
  declare outgoingUsername: string;
  declare outgoingPassword: string;
}

Node.init(
  {
    serviceUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    incomingUsername: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    incomingPasswordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outgoingUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outgoingPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Node',
  }
);

export default Node;
