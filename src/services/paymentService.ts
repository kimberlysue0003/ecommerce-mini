// Payment service for Stripe integration that can talk to both Node and Spring backends
import { API_BASE_URL, ApiError, fetchAPI } from '../config/api';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
  total: number;
}

export interface StripeConfig {
  publishableKey: string;
}

type CartLineItem = { productId: string; quantity: number };

interface SpringCartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
  };
}

interface SpringOrderResponse {
  id: string;
  totalAmount?: number | string;
}

interface SpringPaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

const STRIPE_CONFIG_ENDPOINT = '/payment/config';
const NODE_CREATE_INTENT = '/payment/create-payment-intent';
const NODE_CONFIRM_INTENT = '/payment/confirm-payment';

const SPRING_CREATE_INTENT = '/payment/create-intent';
const SPRING_CONFIRM_INTENT = '/payment/confirm';

const STRIPE_ENV_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const EXPLICIT_BACKEND_FLAVOR = (import.meta.env.VITE_BACKEND_FLAVOR as string | undefined)?.toLowerCase();

type BackendFlavor = 'unknown' | 'node' | 'spring';
let backendFlavor: BackendFlavor = 'unknown';

if (EXPLICIT_BACKEND_FLAVOR === 'spring' || EXPLICIT_BACKEND_FLAVOR === 'node') {
  backendFlavor = EXPLICIT_BACKEND_FLAVOR;
} else if (API_BASE_URL.includes(':3002')) {
  backendFlavor = 'spring';
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const dataCandidate = (payload as any).data;
    if (dataCandidate !== undefined) {
      return dataCandidate as T;
    }
    if ((payload as any).results !== undefined) {
      return (payload as any).results as T;
    }
  }
  return payload as T;
}

function ensureArray<T>(payload: unknown): T[] {
  const data = unwrapData<T[]>(payload);
  if (!Array.isArray(data)) {
    return [];
  }
  return data;
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  }
  return 0;
}

function shouldFallbackToSpring(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 404 || error.status === 405;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('no static resource') || message.includes('not found');
  }
  return false;
}

function toPaymentIntentResponse(payload: Partial<PaymentIntentResponse>): PaymentIntentResponse {
  return {
    clientSecret: payload.clientSecret ?? '',
    paymentIntentId: payload.paymentIntentId ?? '',
    orderId: payload.orderId ?? '',
    total: typeof payload.total === 'number' ? payload.total : 0,
  };
}

/**
 * Get Stripe configuration (publishable key)
 */
export async function getStripeConfig(): Promise<StripeConfig> {
  if (STRIPE_ENV_KEY) {
    return { publishableKey: STRIPE_ENV_KEY };
  }

  try {
    const response = await fetchAPI<StripeConfig | { data: StripeConfig }>(STRIPE_CONFIG_ENDPOINT);
    return unwrapData<StripeConfig>(response);
  } catch (error) {
    if (shouldFallbackToSpring(error)) {
      throw new Error('Stripe publishable key is not configured on the backend.');
    }
    throw error;
  }
}

/**
 * Create a payment intent for cart checkout.
 * Tries the Node backend first, then falls back to the Spring implementation.
 */
export async function createPaymentIntent(items?: CartLineItem[]): Promise<PaymentIntentResponse> {
  if (backendFlavor !== 'spring') {
    try {
      const response = await fetchAPI<PaymentIntentResponse | { data: PaymentIntentResponse }>(NODE_CREATE_INTENT, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      backendFlavor = 'node';
      return toPaymentIntentResponse(unwrapData<PaymentIntentResponse>(response));
    } catch (error) {
      if (!shouldFallbackToSpring(error)) {
        throw error;
      }
      backendFlavor = 'spring';
    }
  }

  return createPaymentIntentSpring(items ?? []);
}

/**
 * Confirm payment after successful Stripe payment.
 * Supports both Node and Spring backends.
 */
export async function confirmPayment(paymentIntentId: string): Promise<void> {
  if (backendFlavor !== 'spring') {
    try {
      await fetchAPI(NODE_CONFIRM_INTENT, {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId }),
      });
      backendFlavor = 'node';
      return;
    } catch (error) {
      if (!shouldFallbackToSpring(error)) {
        throw error;
      }
      backendFlavor = 'spring';
    }
  }

  await fetchAPI(SPRING_CONFIRM_INTENT, {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId }),
  });
}

async function createPaymentIntentSpring(items: CartLineItem[]): Promise<PaymentIntentResponse> {
  if (!items.length) {
    throw new Error('Cart is empty');
  }

  await clearSpringCart();

  for (const item of items) {
    const quantity = Math.max(1, Math.floor(item.quantity ?? 0));
    await fetchAPI(SPRING_CART_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        productId: item.productId,
        quantity,
      }),
    });
  }

  const cartItems = ensureArray<SpringCartItem>(await fetchAPI(SPRING_CART_ENDPOINT));
  if (cartItems.length === 0) {
    throw new Error('Failed to sync cart with server');
  }

  const cartItemIds = cartItems.map((item) => item.id);
  const order = unwrapData<SpringOrderResponse>(await fetchAPI(SPRING_ORDERS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ cartItemIds }),
  }));

  if (!order?.id) {
    throw new Error('Failed to create order before payment');
  }

  const payment = unwrapData<SpringPaymentIntentResponse>(await fetchAPI(SPRING_CREATE_INTENT, {
    method: 'POST',
    body: JSON.stringify({ orderId: order.id }),
  }));

  backendFlavor = 'spring';

  return toPaymentIntentResponse({
    clientSecret: payment.clientSecret,
    paymentIntentId: payment.paymentIntentId,
    orderId: order.id,
    total: parseAmount(order.totalAmount),
  });
}

const SPRING_CART_ENDPOINT = '/cart';
const SPRING_ORDERS_ENDPOINT = '/orders';

async function clearSpringCart() {
  try {
    await fetchAPI(SPRING_CART_ENDPOINT, { method: 'DELETE' });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      // Cart clearing not supported; ignore and proceed
      return;
    }
    throw error;
  }
}
