// Cart GraphQL Resolvers

import { CartService } from '../../services/cart.service.js';
import { GraphQLContext } from '../context.js';
import { GraphQLError } from 'graphql';

export const cartResolvers = {
  Query: {
    cart: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return CartService.getCart(context.user.id);
    },
  },

  Mutation: {
    addToCart: async (
      _: any,
      args: { productId: string; quantity: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await CartService.addToCart(context.user.id, args.productId, args.quantity);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Failed to add to cart', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
    },

    updateCartItem: async (
      _: any,
      args: { itemId: string; quantity: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await CartService.updateCartItem(context.user.id, args.itemId, args.quantity);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Failed to update cart item', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
    },

    removeFromCart: async (
      _: any,
      args: { itemId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await CartService.removeFromCart(context.user.id, args.itemId);
        return true;
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Failed to remove from cart', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
    },

    clearCart: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await CartService.clearCart(context.user.id);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};
