// utils/formatError.ts
import { GraphQLError } from 'graphql';

export const formatError = (err: GraphQLError) => {
  // You can log the original error here for debugging if needed
  // console.error(err);

  return {
    message: err.message,
    code: err.extensions?.code,
    // You can choose to include other fields if necessary
  };
};
