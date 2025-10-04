// Order service
// Business logic for order operations

import { prisma } from '../config/database.js';
import { CreateOrderInput } from '../types/index.js';

export class OrderService {
  /**
   * Create order from cart or custom items
   */
  static async createOrder(userId: string, input?: CreateOrderInput) {
    let orderItems: Array<{ productId: string; quantity: number; price: number }>;

    if (input?.items && input.items.length > 0) {
      // Create order from provided items
      const productIds = input.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      orderItems = input.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      });
    } else {
      // Create order from cart
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate stock
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.title}`);
        }
      }

      orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));
    }

    // Calculate total
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // Update product stock
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Track purchase behavior
      for (const item of orderItems) {
        await tx.userBehavior.create({
          data: {
            userId,
            productId: item.productId,
            action: 'PURCHASE',
          },
        });
      }

      // Clear cart if order was created from cart
      if (!input?.items) {
        await tx.cartItem.deleteMany({
          where: { userId },
        });
      }

      return newOrder;
    });

    return order;
  }

  /**
   * Get user's orders
   */
  static async getOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total, page, limit };
  }

  /**
   * Get order by ID
   */
  static async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }
}
