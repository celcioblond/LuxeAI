import { NavLink, useNavigate } from 'react-router-dom';
import {useAuth} from "../../hooks/useAuth";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-white font-semibold underline'
    : 'text-white/80 hover:text-amber-400 transition-colors';

const Navlinks = () => {
  const {isAuthenticated, logout} = useAuth()!;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <ul className="flex items-center gap-6 list-none">
      {isAuthenticated() && (
        <li>
          <NavLink to="/recommendations" className={linkClass}>
            Recommended
          </NavLink>
        </li>
      )}
      <li>
        <NavLink to="/orders" className={linkClass}>
          My Orders
        </NavLink>
      </li>
      <li>
        <NavLink to="/cart" className={linkClass}>
          Cart
        </NavLink>
      </li>

      {isAuthenticated() && (
        <li>
          <button className="text-white/80 hover:text-amber-400 transition-colors" onClick={handleLogout}>
            Logout
          </button>
        </li>
      )}
    </ul>
  );
};

export default Navlinks;
