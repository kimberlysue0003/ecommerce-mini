// Order GraphQL Resolvers

import { OrderService } from '../../services/order.service.js';
import { GraphQLContext } from '../context.js';
import { GraphQLError } from 'graphql';

export const orderResolvers = {
  Query: {
    orders: async (_: any, args: { page?: number; limit?: number }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await OrderService.getOrders(context.user.id, args.page || 1, args.limit || 10);

      return {
        orders: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    },

    order: async (_: any, args: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await OrderService.getOrderById(context.user.id, args.id);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Order not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
    },
  },

  Mutation: {
    createOrder: async (
      _: any,
      args: { items?: Array<{ productId: string; quantity: number }> },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await OrderService.createOrder(context.user.id, { items: args.items });
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Failed to create order', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
    },
  },
};
