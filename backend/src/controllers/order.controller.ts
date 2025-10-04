// Order controller
// Handles order-related HTTP requests

import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { ApiResponseHelper } from '../utils/responses.js';
import { AuthRequest } from '../types/index.js';

export class OrderController {
  /**
   * Create order
   * POST /api/orders
   */
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const order = await OrderService.createOrder(req.user.id, req.body);

      return ApiResponseHelper.created(res, order, 'Order created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's orders
   * GET /api/orders
   */
  static async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await OrderService.getOrders(req.user.id, page, limit);

      return ApiResponseHelper.paginated(
        res,
        result.orders,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  static async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponseHelper.unauthorized(res);
      }

      const { id } = req.params;

      const order = await OrderService.getOrderById(req.user.id, id);

      return ApiResponseHelper.success(res, order);
    } catch (error) {
      next(error);
    }
  }
}
