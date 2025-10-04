// Authentication controller
// Handles auth-related HTTP requests

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponseHelper } from '../utils/responses.js';
import { AuthRequest } from '../types/index.js';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      const result = await AuthService.register(email, password, name);

      return ApiResponseHelper.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      return ApiResponseHelper.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const user = await AuthService.getUserById(req.user.id);

      return ApiResponseHelper.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}
