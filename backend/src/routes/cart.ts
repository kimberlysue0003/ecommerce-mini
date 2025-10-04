// Cart routes

import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/cart
 * Get user's cart
 */
router.get('/', CartController.getCart);

/**
 * POST /api/cart
 * Add item to cart
 */
router.post(
  '/',
  validate(schemas.addToCart),
  CartController.addToCart
);

/**
 * PUT /api/cart/:itemId
 * Update cart item quantity
 */
router.put(
  '/:itemId',
  validate(schemas.updateCartItem),
  CartController.updateCartItem
);

/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
router.delete('/:itemId', CartController.removeFromCart);

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', CartController.clearCart);

export default router;
