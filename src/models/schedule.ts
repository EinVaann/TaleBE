// src/models/Category.ts

import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize"; // Adjust the import based on your Sequelize setup
import User from "./users"; // Adjust the import based on your User model location

class Schedule extends Model {
  public id!: number;
  public name!: string;
  public userId!: number;
  public content!: string;
  public targetDate!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public updatedAt!: Date;

  public get targetDateFormatted(): string {
    return new Date(this.targetDate * 1000).toLocaleDateString();
  }
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Reference to User model
        key: "id", // Primary key of the User model
      },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Schedule",
    timestamps: true,
    getterMethods: {
      targetDateFormatted() {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        };
        return new Date(this.targetDate).toLocaleDateString(undefined, options);
      }
    }
  }
);

// Define associations
Schedule.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Schedule;
