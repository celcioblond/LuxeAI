import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderByIdService } from '../../services/orderService';
import type { Order } from '../../services/orderService';
import { FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getOrderByIdService(id)
      .then(setOrder)
      .catch(() => {
        setError('Order not found');
        toast.error('Failed to load order');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg">{error || 'Something went wrong'}</p>
          <Link
            to="/homepage"
            className="inline-block bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-300">
      <header className="flex bg-blue-900 justify-between items-center px-8 py-4">
        <Link
          to="/homepage"
          className="bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
        >
          Home
        </Link>
        <h1 className="text-3xl text-white font-bold tracking-tight">Order Confirmed</h1>
        <Link
          to="/orders"
          className="bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
        >
          My Orders
        </Link>
      </header>

      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">

        {/* Success banner */}
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl space-y-3 text-center">
          <FaCheckCircle size={48} className="text-green-500" />
          <h2 className="text-2xl font-bold tracking-tight">Thank you, {order.customer.firstName}!</h2>
          <p className="text-gray-500 text-sm">
            Your order has been placed. You'll receive a confirmation at{' '}
            <span className="font-medium text-gray-700">{order.customer.email}</span>.
          </p>
          <span className="inline-block px-3 py-1 bg-amber-300 rounded-2xl text-xs font-semibold uppercase tracking-widest">
            {order.status}
          </span>
          <p className="text-xs text-gray-400">Order ID: {order._id}</p>
        </div>

        {/* Products */}
        <div className="flex flex-col p-6 bg-white rounded-2xl shadow-2xl space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Items Ordered</h3>
          <div className="divide-y divide-gray-100">
            {order.products.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-2xl border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-800">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.totalAmount.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${order.totalAmount.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {order.totalAmount.shipping === 0
                  ? <span className="text-green-500">Free</span>
                  : `$${order.totalAmount.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>${order.totalAmount.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="flex flex-col p-6 bg-white rounded-2xl shadow-2xl space-y-2">
          <h3 className="text-lg font-bold tracking-tight">Shipping Address</h3>
          <p className="text-gray-600">{order.customer.firstName} {order.customer.lastName}</p>
          <p className="text-gray-600">{order.shippingAddress.street}</p>
          <p className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
          <p className="text-gray-600">{order.shippingAddress.country}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/homepage"
            className="flex-1 text-center py-3 bg-black text-white font-bold rounded-2xl hover:bg-amber-500 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="flex-1 text-center py-3 bg-black text-white font-bold rounded-2xl hover:bg-amber-500 transition-colors duration-200"
          >
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
