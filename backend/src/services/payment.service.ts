// Payment service using Stripe
// Handles payment intent creation and order processing

import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY } from '../config/env';
import { prisma } from '../config/database.js';

// Initialize Stripe client
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

export interface CreatePaymentIntentInput {
  userId: string;
  amount: number; // Amount in cents
  currency?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export class PaymentService {
  /**
   * Create a Stripe payment intent
   */
  static async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<CreatePaymentIntentResponse> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in .env');
    }

    const { userId, amount, currency = 'usd', metadata = {} } = input;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create order from cart and initiate payment
   */
  static async createOrderWithPayment(userId: string) {
    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate total amount
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Create payment intent
    const paymentIntent = await this.createPaymentIntent({
      userId,
      amount: Math.round(total * 100), // Convert to cents
      metadata: {
        orderId: order.id,
      },
    });

    // Clear cart after creating order
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return {
      order,
      payment: paymentIntent,
    };
  }

  /**
   * Confirm payment and update order status
   */
  static async confirmPayment(paymentIntentId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded');
    }

    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      throw new Error('Order ID not found in payment metadata');
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return order;
  }

  /**
   * Get Stripe publishable key for frontend
   */
  static getPublishableKey(): string {
    if (!STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Stripe publishable key is not configured');
    }
    return STRIPE_PUBLISHABLE_KEY;
  }
}
