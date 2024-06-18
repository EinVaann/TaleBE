// src/index.ts
/// <reference path="../types/express.d.ts" />
import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./schema";
import resolvers from "./resolvers";
import sequelize from "./database/sequelize";
import { authenticateJWT } from "./middlewares/auth";
import { formatError } from './utils/formatErrors';
import dotenv from 'dotenv';

console.log("START")
dotenv.config();
const PORT = process.env.PORT || 4000;

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection to Supabase has been established successfully.");

    // Synchronize all defined models to the database
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function startApolloServer() {
  const app = express();
  console.log("App created");
  app.use(authenticateJWT);
  console.log("Authentication set");
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return {
        user: req.user,
        req,
      };
    },
    introspection: true,
    formatError
  });

  await server.start();
  server.applyMiddleware({ app });
  console.log("Server started");
  app.listen(PORT, () => {
    console.log(
      `Server listening on http://localhost:${PORT}${server.graphqlPath}`
    );
    connectToDatabase();
  });
}

startApolloServer().catch((err) => {
  console.error("Error starting server:", err);
});
