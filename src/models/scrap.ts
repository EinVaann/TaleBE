// src/models/Category.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/sequelize'; // Adjust the import based on your Sequelize setup
import User from './users'; // Adjust the import based on your User model location

class Scrap extends Model {
  public id!: number;
  public content!: string;
  public userId!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public updatedAt!: Date;
}

Scrap.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
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
  },
  {
    sequelize,
    modelName: 'Scrap',
    timestamps: true,
    hooks:{
      afterUpdate: async (scrap: Scrap, options: any) => {
        await Scrap.update(
          { updatedAt: new Date() },
          { where: { id: scrap.id }, transaction: options.transaction }
        );
      },
    }
  }
);

// Define associations
Scrap.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Scrap;
