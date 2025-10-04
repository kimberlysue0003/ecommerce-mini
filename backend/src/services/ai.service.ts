// AI Service - Free implementation
// Rule-based NLP search + collaborative filtering recommendations

import { prisma } from '../config/database.js';
import { Product } from '@prisma/client';
import { AISearchQuery } from '../types/index.js';
import { findSimilarProducts, calculateQuerySimilarity } from '../utils/similarity.js';

export class AIService {
  /**
   * Parse natural language search query
   * Enhanced version of frontend's parseQuery
   */
  static parseSearchQuery(query: string): AISearchQuery {
    const lowerQuery = query.toLowerCase().trim();

    const result: AISearchQuery = {
      keywords: [],
      sortBy: 'relevance',
    };

    // Price extraction patterns
    const patterns = {
      // "under 100", "below 200"
      max: /(?:under|below|less than|max|maximum)\s*\$?(\d+)/i,
      // "over 100", "above 200", "more than 150"
      min: /(?:over|above|more than|min|minimum)\s*\$?(\d+)/i,
      // "between 50 and 150", "50-150", "from 50 to 150"
      range: /(?:between|from)?\s*\$?(\d+)\s*(?:and|to|-)\s*\$?(\d+)/i,
    };

    let textQuery = lowerQuery;

    // Extract price range
    const rangeMatch = lowerQuery.match(patterns.range);
    if (rangeMatch) {
      result.priceMin = parseInt(rangeMatch[1], 10);
      result.priceMax = parseInt(rangeMatch[2], 10);
      textQuery = textQuery.replace(rangeMatch[0], '').trim();
    } else {
      const maxMatch = lowerQuery.match(patterns.max);
      if (maxMatch) {
        result.priceMax = parseInt(maxMatch[1], 10);
        textQuery = textQuery.replace(maxMatch[0], '').trim();
      }

      const minMatch = lowerQuery.match(patterns.min);
      if (minMatch) {
        result.priceMin = parseInt(minMatch[1], 10);
        textQuery = textQuery.replace(minMatch[0], '').trim();
      }
    }

    // Extract sorting preference
    if (/best.*rat(?:ed|ing)|top.*rat(?:ed|ing)|highest.*rat(?:ed|ing)/.test(lowerQuery)) {
      result.sortBy = 'rating';
      textQuery = textQuery.replace(/best|top|highest|rated|rating/gi, '').trim();
    } else if (/cheap(?:est)?|lowest.*price|budget/.test(lowerQuery)) {
      result.sortBy = 'price';
      textQuery = textQuery.replace(/cheap(?:est)?|lowest|budget|price/gi, '').trim();
    }

    // Clean up and extract keywords
    const cleanedText = textQuery
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedText) {
      result.text = cleanedText;
      result.keywords = cleanedText.split(' ').filter(w => w.length > 2);
    }

    return result;
  }

  /**
   * AI-powered product search
   */
  static async searchProducts(query: string, limit = 20) {
    const parsedQuery = this.parseSearchQuery(query);

    // Build Prisma where clause
    const where: any = {};

    if (parsedQuery.text) {
      where.OR = [
        { title: { contains: parsedQuery.text, mode: 'insensitive' } },
        { description: { contains: parsedQuery.text, mode: 'insensitive' } },
      ];
    }

    if (parsedQuery.priceMin !== undefined || parsedQuery.priceMax !== undefined) {
      where.price = {};
      if (parsedQuery.priceMin !== undefined) {
        where.price.gte = parsedQuery.priceMin * 100; // Convert to cents
      }
      if (parsedQuery.priceMax !== undefined) {
        where.price.lte = parsedQuery.priceMax * 100;
      }
    }

    // Fetch products
    let products = await prisma.product.findMany({
      where,
      take: limit * 2, // Get more for better ranking
    });

    // Calculate relevance scores
    if (parsedQuery.text) {
      const scoredProducts = products.map(product => {
        const relevance = calculateQuerySimilarity(parsedQuery.text!, product);
        const normalizedRating = product.rating / 5; // 0-1 scale
        const normalizedPrice = 1 - (product.price / 300000); // Assume max $3000

        // Combined score: 50% relevance, 30% rating, 20% popularity (inverse price as proxy)
        const score = relevance * 0.5 + normalizedRating * 0.3 + normalizedPrice * 0.2;

        return { product, score };
      });

      // Sort by score
      scoredProducts.sort((a, b) => b.score - a.score);
      products = scoredProducts.map(s => s.product);
    } else {
      // Sort by preference if no text query
      if (parsedQuery.sortBy === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      } else if (parsedQuery.sortBy === 'price') {
        products.sort((a, b) => a.price - b.price);
      }
    }

    return products.slice(0, limit);
  }

  /**
   * Get similar products (content-based filtering)
   */
  static async getSimilarProducts(productId: string, limit = 5) {
    // Get all products for similarity calculation
    const allProducts = await prisma.product.findMany();

    // Find similar products using TF-IDF
    const similarities = findSimilarProducts(productId, allProducts, limit);

    // Fetch and return similar products
    const similarProductIds = similarities.map(s => s.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: similarProductIds } },
    });

    // Sort by similarity score
    return products.sort((a, b) => {
      const scoreA = similarities.find(s => s.productId === a.id)?.similarity || 0;
      const scoreB = similarities.find(s => s.productId === b.id)?.similarity || 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Get personalized recommendations (collaborative filtering)
   */
  static async getPersonalizedRecommendations(userId: string, limit = 5) {
    // Get user's purchase and view history
    const userBehaviors = await prisma.userBehavior.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (userBehaviors.length === 0) {
      // Return popular products for new users
      return this.getPopularProducts(limit);
    }

    // Extract user's preferred tags
    const tagFrequency = new Map<string, number>();
    for (const behavior of userBehaviors) {
      const weight = behavior.action === 'PURCHASE' ? 3 : behavior.action === 'ADD_TO_CART' ? 2 : 1;
      for (const tag of behavior.product.tags) {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + weight);
      }
    }

    // Get top tags
    const topTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Get viewed/purchased product IDs to exclude
    const excludeIds = userBehaviors.map(b => b.productId);

    // Find products with similar tags
    const recommendations = await prisma.product.findMany({
      where: {
        id: { notIn: excludeIds },
        tags: { hasSome: topTags },
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });

    return recommendations;
  }

  /**
   * Get popular products (trending)
   */
  static async getPopularProducts(limit = 10) {
    // Get most purchased products in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularProducts = await prisma.userBehavior.groupBy({
      by: ['productId'],
      where: {
        action: 'PURCHASE',
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = popularProducts.map(p => p.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Sort by purchase count
    return products.sort((a, b) => {
      const countA = popularProducts.find(p => p.productId === a.id)?._count.productId || 0;
      const countB = popularProducts.find(p => p.productId === b.id)?._count.productId || 0;
      return countB - countA;
    });
  }

  /**
   * Track user behavior (for improving recommendations)
   */
  static async trackBehavior(userId: string, productId: string, action: 'VIEW' | 'ADD_TO_CART' | 'PURCHASE') {
    await prisma.userBehavior.create({
      data: {
        userId,
        productId,
        action,
      },
    });
  }
}
