// Auth GraphQL Resolvers

import { AuthService } from '../../services/auth.service.js';
import { GraphQLContext } from '../context.js';
import { GraphQLError } from 'graphql';

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return AuthService.getUserById(context.user.id);
    },
  },

  Mutation: {
    register: async (_: any, args: { email: string; password: string; name?: string }) => {
      try {
        return await AuthService.register(args.email, args.password, args.name);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Registration failed', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
    },

    login: async (_: any, args: { email: string; password: string }) => {
      try {
        return await AuthService.login(args.email, args.password);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Login failed', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
    },
  },
};
