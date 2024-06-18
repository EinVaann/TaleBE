// src/models/Item.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/sequelize'; // Adjust the import based on your Sequelize setup
import Category from './categories'; // Adjust the import based on your User model location

class Item extends Model {
  public id!: number;
  public title!: string;
  public catId!: number;
  public content!: string;
  public belongTo!: string;
  public check!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public updatedAt!: Date;
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    catId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category, 
        key: 'id'
      }
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true
    },
    belongTo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    check: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  },
  {
    sequelize,
    modelName: 'Item',
    timestamps: true,
    hooks:{
      beforeCreate: async (item: Item) => {
        const category = await Category.findByPk(item.catId)
        if(category?.appliedPreset){
          item.content = category.appliedPreset
        }
      },
      afterUpdate: async (item: Item, options: any) => {
        await Item.update(
          { updatedAt: new Date() },
          { where: { id: item.id }, transaction: options.transaction }
        );
      },
    }
  }
);

// Define associations
Item.belongsTo(Category, {foreignKey:'catId',as:'category'})
export default Item;
