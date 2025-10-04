// GraphQL Context
// Provides request context including authenticated user

import { Request } from 'express';
import { AuthService } from '../services/auth.service.js';

export interface GraphQLContext {
  user?: {
    id: string;
    email: string;
  };
}

export async function createContext(req: Request): Promise<GraphQLContext> {
  const context: GraphQLContext = {};

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyToken(token);

      context.user = {
        id: payload.userId,
        email: payload.email,
      };
    } catch (error) {
      // Invalid token - leave user undefined
    }
  }

  return context;
}
