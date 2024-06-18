// src/models/Category.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/sequelize'; // Adjust the import based on your Sequelize setup
import User from './users'; // Adjust the import based on your User model location

class Category extends Model {
  public id!: number;
  public name!: string;
  public userId!: number;
  public type!: string;
  public data!: string;
  public appliedPreset?: string 

  // timestamps!
  public readonly createdAt!: Date;
  public updatedAt!: Date;
}

Category.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    data: {
      type: DataTypes.STRING, // Example of using JSONB for storing JSON data
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Category',
    timestamps: true,
    hooks:{
      afterFind: (categories: Category | Category[]) => {
        if (!Array.isArray(categories)) {
          categories = [categories]; // Ensure categories is an array
        }
        categories.forEach(category => {
          if (category) {
            category.name = 'Category Name ' + category.name; // Modify the name property as needed
          }
        });
      },
      afterUpdate: async (category: Category, options: any) => {
        await Category.update(
          { updatedAt: new Date() },
          { where: { id: category.id }, transaction: options.transaction }
        );
      },
    }
  }
);

// Define associations
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Category;
