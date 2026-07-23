import { useMemo, useState } from "react";
import useProducts from "../../hooks/useProducts";
import CardProduct from "../../components/CardProduct";
import MainNavigation from "../../components/Navbar/MainNavigation";

const Homepage = () => {
  const { products, loadingProducts } = useProducts();
  const [selected, setSelected] = useState<string | null>(null);

  // Categories are derived from the products themselves (free-form strings on the model),
  // with "All products" first to show the full catalog
  const categories = useMemo(() => {
    const unique = new Set(
      products.map((product) => product.category).filter(Boolean),
    );
    return ["All products", ...Array.from(unique)];
  }, [products]);

  // Default to "All products" until the user picks a category
  const activeCategory = selected ?? "All products";

  const catalog =
    activeCategory === "All products"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <MainNavigation>
      <div className="flex gap-6 p-6">
        {/* Fixed category sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-6 text-xs uppercase tracking-widest text-gray-400">
              Shop by categories
            </h2>
            <nav className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelected(category)}
                  className={`rounded-2xl px-4 py-3 text-center text-sm transition-colors ${
                    activeCategory === category
                      ? "bg-black font-semibold text-white"
                      : "text-gray-600 hover:bg-slate-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Catalog */}
        <div className="flex-1">
          {loadingProducts ? (
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : catalog.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
              <p className="text-gray-500 text-lg">No products in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalog.map((product) => (
                <CardProduct key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainNavigation>
  );
};

export default Homepage;
