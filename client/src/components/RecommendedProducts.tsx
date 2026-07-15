import { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import { getRecommendations } from '../services/recommendationService';
import useAuth from '../hooks/useAuth';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

const RecommendedProducts = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()!;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    getRecommendations()
      .then(setProducts)
      .catch((error) => console.error('Failed to load recommendations', error))
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading || loading || products.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col bg-slate-200 px-8 py-10 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-center">Recommended for you</h2>
      <div className="flex flex-wrap items-center justify-center gap-5">
        {products.map((product) => (
          <CardProduct key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
