import { useState, createContext, useCallback, useEffect } from "react";
import { getProducts as fetchProducts, getProduct as fetchProduct } from "../services/productService";

type ProductContextType = {
  products: any[];
  product: any;
  getProducts: () => Promise<void>;
  getProduct: (id: number) => Promise<void>;
  loadingProducts: boolean;
  loadingProduct: boolean;
  error: string;
}

export const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({children}: { children: React.ReactNode }) => {

  const [products, setProducts] = useState<string[]>([]);
  const [product, setProduct] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState("");

  const getProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(data.products);
    } catch(error) {
      setError("Failed to fetch products");
    }
  }, []);

  const getProduct = useCallback(async (id: number) => {
    try {
      const fetchedProduct = await fetchProduct(id);
      setProduct(fetchedProduct.product);
    } catch(error) {
      setError("Failed to fetch product");
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
    error
  }

  return <ProductContext.Provider value={value}>
    {children}
  </ProductContext.Provider>
}