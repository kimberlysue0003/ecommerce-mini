// Product controller
// Handles product-related HTTP requests

import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { ApiResponseHelper } from '../utils/responses.js';
import { ProductFilter } from '../types/index.js';

export class ProductController {
  /**
   * Get all products with filters
   * GET /api/products
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, tags, minPrice, maxPrice, minRating, inStock, page, limit } = req.query;

      const filter: ProductFilter = {
        search: search as string,
        tags: tags ? (tags as string).split(',') : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        inStock: inStock === 'true',
      };

      const result = await ProductService.getProducts(
        filter,
        Number(page) || 1,
        Number(limit) || 20
      );

      return ApiResponseHelper.paginated(
        res,
        result.products,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await ProductService.getProductById(id);

      return ApiResponseHelper.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by slug
   * GET /api/products/slug/:slug
   */
  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const product = await ProductService.getProductBySlug(slug);

      return ApiResponseHelper.success(res, product);
    } catch (error) {
      next(error);
    }
  }
}
