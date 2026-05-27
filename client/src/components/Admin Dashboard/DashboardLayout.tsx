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
      ? 'font-semibold underline'
      : 'text-gray-600 hover:text-black transition-colors';

  return (
    <div className="min-h-screen bg-slate-200">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold tracking-widest uppercase">
          Admin Panel
        </h1>
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
            <li><span className="text-gray-300">|</span></li>
            <li className="text-sm text-gray-500">{auth?.user?.name}</li>
            <li>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-black transition-colors"
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
