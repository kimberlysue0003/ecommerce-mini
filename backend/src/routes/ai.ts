// AI routes

import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

/**
 * POST /api/ai/search
 * AI-powered natural language product search
 */
router.post(
  '/search',
  validate(schemas.aiSearch),
  AIController.search
);

/**
 * GET /api/ai/recommend/:productId
 * Get similar products based on content
 */
router.get(
  '/recommend/:productId',
  AIController.getSimilarProducts
);

/**
 * GET /api/ai/recommend/user
 * Get personalized recommendations (requires auth, optional for popular products)
 */
router.get(
  '/recommend/user',
  optionalAuth,
  AIController.getPersonalizedRecommendations
);

/**
 * GET /api/ai/popular
 * Get popular/trending products
 */
router.get('/popular', AIController.getPopularProducts);

export default router;
