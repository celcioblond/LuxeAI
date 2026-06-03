import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllOrdersService, updateOrderStatusService } from '../../services/orderService';
import type { Order } from '../../services/orderService';

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  paid: 'bg-blue-200 text-blue-800',
  processing: 'bg-purple-200 text-purple-800',
  shipped: 'bg-cyan-200 text-cyan-800',
  delivered: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-200 text-red-800',
};

const statusOptions: Order['status'][] = [
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getAllOrdersService()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    setUpdatingId(id);
    try {
      const updated = await updateOrderStatusService(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: updated.status } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-8">Orders</h2>

      <div className="flex flex-col p-6 shadow-2xl bg-white rounded-2xl">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Order ID</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Customer</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Date</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Total</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Status</th>
                <th className="text-right py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 text-gray-500 font-mono text-xs max-w-[120px] truncate">
                    {order._id}
                  </td>
                  <td className="py-4">
                    <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                    <p className="text-xs text-gray-400">{order.customer.email}</p>
                  </td>
                  <td className="py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span className="inline-block px-3 py-0.5 bg-amber-300 rounded-2xl text-sm font-semibold">
                      ${order.totalAmount.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-block px-3 py-0.5 rounded-2xl text-xs font-semibold uppercase tracking-widest ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as Order['status'])}
                      className="text-xs font-bold bg-black text-white rounded-2xl px-3 py-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
