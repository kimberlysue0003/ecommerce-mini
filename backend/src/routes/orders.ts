// Order routes

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * POST /api/orders
 * Create new order from cart or custom items
 */
router.post(
  '/',
  validate(schemas.createOrder),
  OrderController.createOrder
);

/**
 * GET /api/orders
 * Get user's orders with pagination
 */
router.get('/', OrderController.getOrders);

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get(
  '/:id',
  validate(schemas.orderId),
  OrderController.getOrderById
);

export default router;
