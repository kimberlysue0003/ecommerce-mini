// Payment routes for Stripe integration
// Handles payment intent creation and order checkout

import { Router, Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { PaymentService } from '../services/payment.service';
import { authenticate } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();

// Get Stripe publishable key
router.get('/config', (_req: Request, res: Response) => {
  try {
    const publishableKey = PaymentService.getPublishableKey();
    res.json({ publishableKey });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get Stripe config',
    });
  }
});

// Create payment intent for cart checkout
const createPaymentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
  })).optional(),
});

router.post(
  '/create-payment-intent',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { items } = createPaymentSchema.parse(req.body);

      // If items provided, sync to backend cart first
      if (items && items.length > 0) {
        const { prisma } = await import('../config/database.js');

        // Validate and filter only valid productIds
        const productIds = items.map(item => item.productId);
        const validProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true },
        });

        const validProductIds = new Set(validProducts.map(p => p.id));
        const validItems = items.filter(item => validProductIds.has(item.productId));

        if (validItems.length === 0) {
          throw new Error('No valid products in cart');
        }

        // Clear existing cart
        await prisma.cartItem.deleteMany({ where: { userId } });
        // Add only valid items
        for (const item of validItems) {
          await prisma.cartItem.create({
            data: {
              userId,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }

      const result = await PaymentService.createOrderWithPayment(userId);

      res.json({
        orderId: result.order.id,
        clientSecret: result.payment.clientSecret,
        paymentIntentId: result.payment.paymentIntentId,
        total: result.order.total,
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      });
    }
  }
);

// Confirm payment webhook (called after successful payment)
const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
});

router.post(
  '/confirm-payment',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { paymentIntentId } = confirmPaymentSchema.parse(req.body);

      const order = await PaymentService.confirmPayment(paymentIntentId);

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      });
    }
  }
);

export default router;
