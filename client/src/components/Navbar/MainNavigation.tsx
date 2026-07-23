import { NavLink } from 'react-router-dom';
import Navlinks from './Navlinks';

const MainNavigation = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 bg-blue-900">
        <NavLink
          to="/homepage"
          className="text-2xl font-bold uppercase tracking-tight text-white transition-colors hover:text-amber-400"
        >
          E-commerce
        </NavLink>
        <nav>
          <Navlinks />
        </nav>
      </header>
      <main className="min-h-screen bg-slate-300">{children}</main>
    </>
  );
};

export default MainNavigation;
