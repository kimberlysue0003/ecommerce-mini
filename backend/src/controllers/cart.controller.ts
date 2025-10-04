// Cart controller
// Handles cart-related HTTP requests

import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service.js';
import { ApiResponseHelper } from '../utils/responses.js';
import { AuthRequest } from '../types/index.js';

export class CartController {
  /**
   * Get user's cart
   * GET /api/cart
   */
  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const cart = await CartService.getCart(req.user.id);

      return ApiResponseHelper.success(res, cart);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/cart
   */
  static async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const { productId, quantity } = req.body;

      const cartItem = await CartService.addToCart(req.user.id, productId, quantity);

      return ApiResponseHelper.created(res, cartItem, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   * PUT /api/cart/:itemId
   */
  static async updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const { itemId } = req.params;
      const { quantity } = req.body;

      const cartItem = await CartService.updateCartItem(req.user.id, itemId, quantity);

      if (!cartItem) {
        return ApiResponseHelper.success(res, null, 'Item removed from cart');
      }

      return ApiResponseHelper.success(res, cartItem, 'Cart item updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/cart/:itemId
   */
  static async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const { itemId } = req.params;

      await CartService.removeFromCart(req.user.id, itemId);

      return ApiResponseHelper.success(res, null, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/cart
   */
  static async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      await CartService.clearCart(req.user.id);

      return ApiResponseHelper.success(res, null, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}
