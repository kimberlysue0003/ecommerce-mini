// Request validation middleware using Zod
// Validates request body, query, and params

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Middleware factory for validating request data
 */
export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate query
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      // Validate params
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      next(error);
    }
  };
}

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: {
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().optional(),
    }),
  },

  login: {
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  },

  // Product schemas
  productQuery: {
    query: z.object({
      search: z.string().optional(),
      tags: z.string().optional(), // Comma-separated
      minPrice: z.string().transform(Number).optional(),
      maxPrice: z.string().transform(Number).optional(),
      minRating: z.string().transform(Number).optional(),
      inStock: z.string().transform(val => val === 'true').optional(),
      page: z.string().transform(Number).default('1'),
      limit: z.string().transform(Number).default('20'),
    }),
  },

  productId: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required'),
    }),
  },

  // Cart schemas
  addToCart: {
    body: z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    }),
  },

  updateCartItem: {
    params: z.object({
      itemId: z.string().min(1, 'Cart item ID is required'),
    }),
    body: z.object({
      quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    }),
  },

  // Order schemas
  createOrder: {
    body: z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })).optional(),
    }),
  },

  orderId: {
    params: z.object({
      id: z.string().min(1, 'Order ID is required'),
    }),
  },

  // AI schemas
  aiSearch: {
    body: z.object({
      query: z.string().min(1, 'Search query is required'),
    }),
  },

  recommendations: {
    query: z.object({
      productId: z.string().optional(),
      limit: z.string().transform(Number).default('5'),
    }),
  },
};
