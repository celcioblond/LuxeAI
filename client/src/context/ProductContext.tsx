import { useState, createContext, useCallback, useEffect } from 'react';
import {
  getProducts as fetchProducts,
  getProduct as fetchProduct,
} from '../services/productService';

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl: string;
}

type ProductContextType = {
  products: Product[];
  product: Product | null;
  getProducts: () => Promise<void>;
  getProduct: (id: string) => Promise<void>;
  loadingProducts: boolean;
  loadingProduct: boolean;
  error: string;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState('');

  const getProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await fetchProducts();
      setProducts(data.products);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const getProduct = useCallback(async (id: string) => {
    try {
      setLoadingProduct(true);
      const fetchedProduct = await fetchProduct(id);
      setProduct(fetchedProduct.product);
    } catch {
      setError('Failed to fetch product');
    } finally {
      setLoadingProduct(false); // always runs
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const value = {
    products,
    product,
    getProducts,
    getProduct,
    loadingProduct,
    loadingProducts,
    error,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
