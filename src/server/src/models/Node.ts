import { DataTypes, Model } from 'sequelize';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

class Node extends Model {
  declare id: typeof uuidv4;
  declare username: string;
  declare passwordHash: string;
}

Node.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Node',
    underscored: true,
  }
);

export default Node;
