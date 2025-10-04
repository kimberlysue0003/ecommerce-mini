// GraphQL Resolvers
// Combines all resolvers into a single object

import { authResolvers } from './auth.resolver.js';
import { productResolvers } from './product.resolver.js';
import { cartResolvers } from './cart.resolver.js';
import { orderResolvers } from './order.resolver.js';
import { aiResolvers } from './ai.resolver.js';

export const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...authResolvers.Query,
    ...cartResolvers.Query,
    ...orderResolvers.Query,
    ...aiResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation,
  },
};
