// Authentication middleware
// Verifies JWT tokens and attaches user info to request

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { AuthService } from '../services/auth.service.js';
import { ApiResponseHelper } from '../utils/responses.js';

/**
 * Middleware to authenticate requests using JWT
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponseHelper.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return ApiResponseHelper.unauthorized(res, message);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if not
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyToken(token);

      req.user = {
        id: payload.userId,
        email: payload.email,
      };
    }
  } catch (error) {
    // Silently fail - user remains unauthenticated
  }

  next();
}
