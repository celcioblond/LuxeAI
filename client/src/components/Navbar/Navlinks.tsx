import { NavLink, useNavigate } from 'react-router-dom';
import {useAuth} from "../../hooks/useAuth";

const Navlinks = () => {
  const {isAuthenticated, logout} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <ul className="flex items-center gap-6 list-none">
      <li>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive
              ? 'font-semibold underline'
              : 'text-gray-600 hover:text-black transition-colors'
          }
        >
          Account
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive
              ? 'font-semibold underline'
              : 'text-gray-600 hover:text-black transition-colors'
          }
        >
          Cart
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/checkout"
          className={({ isActive }) =>
            isActive
              ? 'font-semibold underline'
              : 'text-gray-600 hover:text-black transition-colors'
          }
        >
          Checkout
        </NavLink>
      </li>

      {isAuthenticated() && (
        <li>
          <button className="text-gray-600 hover:text-black transition-colors"onClick={handleLogout}>
            Logout
          </button>
        </li>
      )}
    </ul>
  );
};

export default Navlinks;
