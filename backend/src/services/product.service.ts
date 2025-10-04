// Product service
// Business logic for product operations

import { prisma } from '../config/database.js';
import { ProductFilter } from '../types/index.js';

export class ProductService {
  /**
   * Get all products with filters and pagination
   */
  static async getProducts(filter: ProductFilter, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.tags && filter.tags.length > 0) {
      where.tags = { hasSome: filter.tags };
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.price = {};
      if (filter.minPrice !== undefined) {
        where.price.gte = filter.minPrice * 100; // Convert to cents
      }
      if (filter.maxPrice !== undefined) {
        where.price.lte = filter.maxPrice * 100;
      }
    }

    if (filter.minRating !== undefined) {
      where.rating = { gte: filter.minRating };
    }

    if (filter.inStock) {
      where.stock = { gt: 0 };
    }

    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Get multiple products by IDs
   */
  static async getProductsByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
    });
  }
}
