import Navlinks from './Navlinks';

const MainNavigation = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold tracking-widest uppercase">
          E-commerce
        </h1>
        <nav>
          <Navlinks />
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
};

export default MainNavigation;
