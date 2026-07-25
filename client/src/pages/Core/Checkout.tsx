import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createOrderService, confirmOrderService } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutForm {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const emptyForm: CheckoutForm = {
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, total, quantity, clearCart } = useCart();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const setField = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const tax = parseFloat((total * 0.1).toFixed(2));
  const shipping = total >= 100 ? 0 : 10;
  const orderTotal = parseFloat((total + tax + shipping).toFixed(2));

  const handleShippingSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await createOrderService({
        firstName: form.firstName,
        lastName: form.lastName,
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
      });
      setOrderId(result.orderId);
      setClientSecret(result.clientSecret);
      setStep('payment');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setPaying(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElement } },
    );

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      toast.error(stripeError.message || 'Payment failed');
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Mark the order paid server-side (verified against Stripe). If it fails,
      // the payment still went through — navigate anyway and let the webhook
      // reconcile the status.
      if (orderId) {
        try {
          await confirmOrderService(orderId);
        } catch {
          // swallow: payment succeeded, status will reconcile via webhook
        }
      }
      await clearCart();
      toast.success('Payment successful!');
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  if (!cart || cart.products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-lg">Your cart is empty.</p>
          <Link
            to="/homepage"
            className="inline-block bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-400 hover:text-black transition-colors text-sm font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-300">
      <header className="flex bg-blue-900 justify-between items-center px-8 py-4">
        <Link
          to="/cart"
          className="bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
        >
          ← Back to Cart
        </Link>
        <h1 className="text-3xl text-white font-bold tracking-tight">Checkout</h1>
        <div className="text-white text-sm font-medium">{quantity} items</div>
      </header>

      <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left — Form */}
        <div className="flex flex-col p-8 bg-white rounded-2xl shadow-2xl space-y-6">

          <div className="flex items-center gap-3 text-sm font-medium">
            <span className={step === 'shipping' ? 'text-black font-bold' : 'text-gray-400'}>
              1. Shipping
            </span>
            <span className="text-gray-300">→</span>
            <span className={step === 'payment' ? 'text-black font-bold' : 'text-gray-400'}>
              2. Payment
            </span>
          </div>

          {step === 'shipping' ? (
            <form onSubmit={handleShippingSubmit} className="space-y-5">
              <h2 className="text-lg font-bold tracking-tight">Shipping Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => setField('street', e.target.value)}

                  className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}

                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setField('state', e.target.value)}

                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={form.zip}
                    onChange={(e) => setField('zip', e.target.value)}

                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => setField('country', e.target.value)}

                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white font-bold rounded-2xl hover:bg-amber-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue to Payment →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePayment} className="space-y-5">
              <h2 className="text-lg font-bold tracking-tight">Payment</h2>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Card Details</label>
                <div className="border-b-2 border-gray-300 focus-within:border-black transition-colors py-2">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#374151',
                          '::placeholder': { color: '#9CA3AF' },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">🔒 Your payment is secured by Stripe</p>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={paying || !stripe}
                className="w-full py-3 bg-black text-white font-bold rounded-2xl hover:bg-amber-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {paying ? 'Processing payment...' : `Pay $${orderTotal.toFixed(2)}`}
              </button>

              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="w-full text-sm text-gray-500 hover:text-black transition-colors"
              >
                ← Back to Shipping
              </button>
            </form>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="flex flex-col p-8 bg-white rounded-2xl shadow-2xl space-y-4 h-fit">
          <h2 className="text-lg font-bold tracking-tight">Order Summary</h2>

          <div className="divide-y divide-gray-100">
            {cart.products.map((item) => (
              <div key={item._id} className="flex items-center gap-3 py-3">
                <img
                  src={item.productId.imageUrl}
                  alt={item.productId.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.productId.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  ${(item.productId.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? <span className="text-green-500">Free</span>
                  : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
