// Checkout modal with Stripe payment integration
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment, getStripeConfig } from '../services/paymentService';
import { formatPrice } from '../lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  items: Array<{productId: string; quantity: number}>;
  onSuccess: () => void;
}

let stripePromise: ReturnType<typeof loadStripe> | null = null;

// Initialize Stripe with publishable key from backend
const getStripe = async () => {
  if (!stripePromise) {
    const config = await getStripeConfig();
    stripePromise = loadStripe(config.publishableKey);
  }
  return stripePromise;
};

function CheckoutForm({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await confirmPayment(paymentIntent.id);

        // Success - close modal and trigger success callback
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold">{formatPrice(total)}</span>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {processing ? 'Processing...' : `Pay ${formatPrice(total)}`}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </div>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, total, items, onSuccess }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      initializePayment();
    }
  }, [isOpen, items]);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load Stripe
      const stripeInstance = await getStripe();
      setStripe(stripeInstance);

      // Create payment intent with cart items
      const response = await createPaymentIntent(items);
      setClientSecret(response.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Initializing payment...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={initializePayment}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && clientSecret && stripe && (
          <Elements stripe={stripe} options={{ clientSecret }}>
            <CheckoutForm total={total} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        )}
      </div>
    </div>
  );
}
