// Cart service
// Business logic for shopping cart operations

import { prisma } from '../config/database.js';

export class CartService {
  /**
   * Get user's cart
   */
  static async getCart(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return cartItems;
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId: string, productId: string, quantity: number) {
    // Check if product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new Error('Insufficient stock');
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });

      return updatedItem;
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: { product: true },
    });

    return cartItem;
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(userId: string, itemId: string, quantity: number) {
    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Remove if quantity is 0
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      return null;
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    return updatedItem;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, itemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: string) {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
