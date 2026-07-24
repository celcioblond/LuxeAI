import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const DashboardLayout = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-white font-semibold underline'
      : 'text-white/80 hover:text-amber-400 transition-colors';

  return (
    <div className="min-h-screen bg-slate-300">
      <header className="flex items-center justify-between px-8 py-4 bg-blue-900">
        <NavLink
          to="/admin-dashboard"
          end
          className="text-2xl font-bold uppercase tracking-tight text-white transition-colors hover:text-amber-400"
        >
          Admin Panel
        </NavLink>
        <nav>
          <ul className="flex items-center gap-6 list-none">
            <li>
              <NavLink to="/admin-dashboard" end className={linkClass}>
                Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/users" className={linkClass}>
                Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/products" className={linkClass}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/orders" className={linkClass}>
                Orders
              </NavLink>
            </li>
            <li><span className="text-white/30">|</span></li>
            <li className="text-sm text-white/70">{auth?.user?.name}</li>
            <li>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-amber-400 transition-colors"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
