// src/models/Category.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/sequelize'; // Adjust the import based on your Sequelize setup
import User from './users'; // Adjust the import based on your User model location

class Preset extends Model {
  public id!: number;
  public name!: string;
  public userId!: number;
  public content!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public updatedAt!: Date;
}

Preset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Reference to User model
        key: 'id' // Primary key of the User model
      }
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true
    },
  },
  {
    sequelize,
    modelName: 'Preset',
    timestamps: true,
  }
);

// Define associations
Preset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Preset;
