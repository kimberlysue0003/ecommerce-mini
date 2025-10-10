// Global error handling middleware
// Catches and formats errors consistently

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ApiResponseHelper } from '../utils/responses.js';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Global error handler
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error
  logger.error('Request error:', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
  });

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return handleZodError(error, res);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ApiResponseHelper.unauthorized(res, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponseHelper.unauthorized(res, 'Token expired');
  }

  // Default error
  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number'
    ? error.statusCode
    : 500;

  const message = error.message || 'Internal server error';

  return ApiResponseHelper.error(res, message, statusCode);
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, res: Response) {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return ApiResponseHelper.error(res, `${field} already exists`, 409);

    case 'P2025':
      // Record not found
      return ApiResponseHelper.notFound(res, 'Resource');

    case 'P2003':
      // Foreign key constraint violation
      return ApiResponseHelper.error(res, 'Related resource not found', 400);

    default:
      logger.error('Unhandled Prisma error:', error);
      return ApiResponseHelper.serverError(res);
  }
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError, res: Response) {
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

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(_req: Request, res: Response) {
  return ApiResponseHelper.notFound(res, 'Route');
}
