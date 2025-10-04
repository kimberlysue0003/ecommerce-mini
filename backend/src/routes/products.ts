// Product routes

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

/**
 * GET /api/products
 * Get all products with optional filters and pagination
 */
router.get(
  '/',
  validate(schemas.productQuery),
  ProductController.getProducts
);

/**
 * GET /api/products/slug/:slug
 * Get product by slug
 */
router.get(
  '/slug/:slug',
  ProductController.getProductBySlug
);

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get(
  '/:id',
  validate(schemas.productId),
  ProductController.getProductById
);

export default router;
