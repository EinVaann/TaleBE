import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
console.log()
const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
  dialect: "postgres",
});

export default sequelize;
