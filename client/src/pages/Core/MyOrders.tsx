import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNavigation from '../../components/Navbar/MainNavigation';
import { getMyOrdersService } from '../../services/orderService';
import type { Order } from '../../services/orderService';
import toast from 'react-hot-toast';

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  paid: 'bg-blue-200 text-blue-800',
  processing: 'bg-purple-200 text-purple-800',
  shipped: 'bg-cyan-200 text-cyan-800',
  delivered: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-200 text-red-800',
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrdersService()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainNavigation>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          My Orders
        </h1>

        {loading ? (
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
            <p className="text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
            <p className="text-gray-500 text-lg">You have no orders yet.</p>
            <Link
              to="/homepage"
              className="bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/order-confirmation/${order._id}`)}
                className="flex cursor-pointer flex-col space-y-4 rounded-2xl bg-white p-6 shadow-2xl duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{order._id}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-2xl text-xs font-semibold uppercase tracking-widest ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {order.products.slice(0, 3).map((item) => (
                    <img
                      key={item.productId}
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-2xl border border-gray-100"
                    />
                  ))}
                  {order.products.length > 3 && (
                    <span className="text-sm text-gray-400">+{order.products.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold text-gray-900 text-base">${order.totalAmount.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default MyOrders;
