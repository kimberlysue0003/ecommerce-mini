// Standardized API response helpers
// Ensures consistent response format across all endpoints

import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/index.js';

export class ApiResponseHelper {
  /**
   * Send success response
   */
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(res: Response, error: string, statusCode = 400): Response {
    const response: ApiResponse = {
      success: false,
      error,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    statusCode = 200
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send not found response (404)
   */
  static notFound(res: Response, resource = 'Resource'): Response {
    return this.error(res, `${resource} not found`, 404);
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  /**
   * Send internal server error (500)
   */
  static serverError(res: Response, message = 'Internal server error'): Response {
    return this.error(res, message, 500);
  }
}
