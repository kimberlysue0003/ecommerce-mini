// Authentication routes

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate(schemas.register),
  AuthController.register
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validate(schemas.login),
  AuthController.login
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authenticate,
  AuthController.me
);

export default router;
