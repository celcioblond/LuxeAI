import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

interface Stats {
  userCount: number;
  productCount: number;
  orderCount: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-8">Overview</h2>

      <div className="flex flex-wrap gap-6 mb-10">
        <div
          onClick={() => navigate('/admin-dashboard/users')}
          className="flex flex-col p-6 space-y-4 shadow-2xl bg-white rounded-2xl hover:scale-105 duration-200 cursor-pointer min-w-52"
        >
          <p className="text-gray-500 text-sm uppercase tracking-widest">Total Users</p>
          {loading ? (
            <div className="h-10 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold">{stats?.userCount ?? 0}</p>
          )}
          <span className="inline-block px-3 py-1 bg-amber-300 rounded-2xl text-sm font-semibold w-fit">
            Manage users →
          </span>
        </div>

        <div
          onClick={() => navigate('/admin-dashboard/products')}
          className="flex flex-col p-6 space-y-4 shadow-2xl bg-white rounded-2xl hover:scale-105 duration-200 cursor-pointer min-w-52"
        >
          <p className="text-gray-500 text-sm uppercase tracking-widest">Total Products</p>
          {loading ? (
            <div className="h-10 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold">{stats?.productCount ?? 0}</p>
          )}
          <span className="inline-block px-3 py-1 bg-amber-300 rounded-2xl text-sm font-semibold w-fit">
            Manage products →
          </span>
        </div>

        <div
          onClick={() => navigate('/admin-dashboard/orders')}
          className="flex flex-col p-6 space-y-4 shadow-2xl bg-white rounded-2xl hover:scale-105 duration-200 cursor-pointer min-w-52"
        >
          <p className="text-gray-500 text-sm uppercase tracking-widest">Total Orders</p>
          {loading ? (
            <div className="h-10 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold">{stats?.orderCount ?? 0}</p>
          )}
          <span className="inline-block px-3 py-1 bg-amber-300 rounded-2xl text-sm font-semibold w-fit">
            Manage orders →
          </span>
        </div>
      </div>

      <div className="flex flex-col p-6 shadow-2xl bg-white rounded-2xl space-y-4 w-fit">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin-dashboard/users')}
            className="px-4 py-2 bg-black text-white rounded-2xl text-sm font-bold hover:bg-amber-300 hover:text-black transition-colors duration-200"
          >
            View all users
          </button>
          <button
            onClick={() => navigate('/admin-dashboard/products')}
            className="px-4 py-2 bg-black text-white rounded-2xl text-sm font-bold hover:bg-amber-300 hover:text-black transition-colors duration-200"
          >
            View all products
          </button>
          <button
            onClick={() => navigate('/admin-dashboard/products')}
            className="px-4 py-2 bg-black text-white rounded-2xl text-sm font-bold hover:bg-amber-300 hover:text-black transition-colors duration-200"
          >
            Add new product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
