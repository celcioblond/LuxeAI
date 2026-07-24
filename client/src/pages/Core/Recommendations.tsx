import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainNavigation from "../../components/Navbar/MainNavigation";
import CardProduct from "../../components/CardProduct";
import { getRecommendations } from "../../services/recommendationService";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

const Recommendations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations()
      .then(setProducts)
      .catch((error) => console.error("Failed to load recommendations", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainNavigation>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Recommended for you
        </h1>

        {loading ? (
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
            <p className="text-gray-400">Loading recommendations...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
            <p className="text-gray-500 text-lg">Make a purchase to start getting recommended products!</p>
            <Link
              to="/homepage"
              className="bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <CardProduct key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Recommendations;
