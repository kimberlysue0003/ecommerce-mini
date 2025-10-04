// AI GraphQL Resolvers

import { AIService } from '../../services/ai.service.js';
import { GraphQLContext } from '../context.js';

export const aiResolvers = {
  Query: {
    aiSearch: async (_: any, args: { query: string; limit?: number }) => {
      const products = await AIService.searchProducts(args.query, args.limit || 20);

      return {
        query: args.query,
        results: products,
      };
    },

    similarProducts: async (_: any, args: { productId: string; limit?: number }) => {
      return AIService.getSimilarProducts(args.productId, args.limit || 5);
    },

    recommendations: async (_: any, args: { limit?: number }, context: GraphQLContext) => {
      if (context.user) {
        return AIService.getPersonalizedRecommendations(context.user.id, args.limit || 5);
      }

      // Return popular products for unauthenticated users
      return AIService.getPopularProducts(args.limit || 5);
    },

    popularProducts: async (_: any, args: { limit?: number }) => {
      return AIService.getPopularProducts(args.limit || 10);
    },
  },
};
