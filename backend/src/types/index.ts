// Type definitions for the backend application
// All comments in English per project requirements

import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// API Response wrapper types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Product filter types
export interface ProductFilter {
  search?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
}

// AI search types
export interface AISearchQuery {
  text?: string;
  priceMin?: number;
  priceMax?: number;
  keywords?: string[];
  sortBy?: 'price' | 'rating' | 'relevance';
}

// Recommendation types
export interface RecommendationOptions {
  userId?: string;
  productId?: string;
  limit?: number;
  algorithm?: 'collaborative' | 'content' | 'hybrid';
}

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Auth response
export interface AuthPayload {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

// Cart types
export interface CartItemInput {
  productId: string;
  quantity: number;
}

// Order types
export interface CreateOrderInput {
  items?: { productId: string; quantity: number }[];
}

export interface OrderWithItems {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      slug: string;
    };
  }>;
}

// TF-IDF types for similarity calculation
export interface DocumentVector {
  productId: string;
  vector: Map<string, number>;
  magnitude: number;
}

// User behavior tracking
export type UserAction = 'VIEW' | 'ADD_TO_CART' | 'PURCHASE';
