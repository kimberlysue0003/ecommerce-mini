// AI controller
// Handles AI-powered search and recommendation requests

import { Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';
import { ApiResponseHelper } from '../utils/responses.js';
import { AuthRequest } from '../types/index.js';

export class AIController {
  /**
   * AI-powered search
   * POST /api/ai/search
   */
  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const limit = Number(req.query.limit) || 20;

      const products = await AIService.searchProducts(query, limit);

      return ApiResponseHelper.success(res, {
        query,
        parsed: AIService.parseSearchQuery(query),
        results: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get similar products
   * GET /api/ai/recommend/:productId
   */
  static async getSimilarProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const limit = Number(req.query.limit) || 5;

      const products = await AIService.getSimilarProducts(productId, limit);

      return ApiResponseHelper.success(res, products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get personalized recommendations
   * GET /api/ai/recommend/user
   */
  static async getPersonalizedRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        // Return popular products for unauthenticated users
        const limit = Number(req.query.limit) || 5;
        const products = await AIService.getPopularProducts(limit);
        return ApiResponseHelper.success(res, products);
      }

      const limit = Number(req.query.limit) || 5;
      const products = await AIService.getPersonalizedRecommendations(req.user.id, limit);

      return ApiResponseHelper.success(res, products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular/trending products
   * GET /api/ai/popular
   */
  static async getPopularProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 10;
      const products = await AIService.getPopularProducts(limit);

      return ApiResponseHelper.success(res, products);
    } catch (error) {
      next(error);
    }
  }
}
