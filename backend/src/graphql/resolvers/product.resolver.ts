// Product GraphQL Resolvers

import { ProductService } from '../../services/product.service.js';
import { ProductFilter } from '../../types/index.js';

export const productResolvers = {
  Query: {
    products: async (
      _: any,
      args: {
        filter?: {
          search?: string;
          tags?: string[];
          minPrice?: number;
          maxPrice?: number;
          minRating?: number;
          inStock?: boolean;
        };
        page?: number;
        limit?: number;
      }
    ) => {
      const filter: ProductFilter = args.filter || {};
      const result = await ProductService.getProducts(filter, args.page || 1, args.limit || 20);

      return {
        products: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    },

    product: async (_: any, args: { id: string }) => {
      try {
        return await ProductService.getProductById(args.id);
      } catch (error) {
        return null;
      }
    },

    productBySlug: async (_: any, args: { slug: string }) => {
      try {
        return await ProductService.getProductBySlug(args.slug);
      } catch (error) {
        return null;
      }
    },
  },
};
