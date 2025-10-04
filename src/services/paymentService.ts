// Payment service for Stripe integration
import { fetchAPI } from '../config/api';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
  total: number;
}

export interface StripeConfig {
  publishableKey: string;
}

/**
 * Get Stripe configuration (publishable key)
 */
export async function getStripeConfig(): Promise<StripeConfig> {
  return fetchAPI('/payment/config');
}

/**
 * Create a payment intent for cart checkout
 */
export async function createPaymentIntent(items?: Array<{productId: string; quantity: number}>): Promise<PaymentIntentResponse> {
  return fetchAPI('/payment/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

/**
 * Confirm payment after successful Stripe payment
 */
export async function confirmPayment(paymentIntentId: string): Promise<any> {
  return fetchAPI('/payment/confirm-payment', {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId }),
  });
}
