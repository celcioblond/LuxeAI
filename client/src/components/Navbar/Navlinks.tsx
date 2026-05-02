import { NavLink } from 'react-router-dom';

const Navlinks = () => {
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
    </ul>
  );
};

export default Navlinks;
