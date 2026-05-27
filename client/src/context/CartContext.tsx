import { createContext, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import {
  addToCartService,
  clearCartService,
  deleteProductService,
  getCartService,
  getCartTotalService,
  updateCartService,
} from '../services/cartService';

interface CartProduct {
  productId: {
    _id: string;
    name: string;
    price: number;
    description: string;
    stock: number;
    imageUrl: string;
  };
  quantity: number;
  _id: string;
}

interface Cart {
  _id: string;
  userId: string;
  products: CartProduct[];
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  quantity: number;
  loading: boolean;
  updating: boolean;
  total: number;
  fetchCart: () => void;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeProductFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  getCartTotal: () => Promise<void>;
  clearCart: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // initial fetch only
  const [updating, setUpdating] = useState<boolean>(false); // mutations only
  const [total, setTotal] = useState<number>(0);

  const { user, getUserId, loading: authLoading, isAdmin } = useAuth()!;

  const fetchCart = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const response = await getCartService(userId);
      setCart(response);
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user && !isAdmin()) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, authLoading]);

  useEffect(() => {
    const newTotal = cart?.products.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0,
    );
    setTotal(newTotal ?? 0);

    const newQuantity = cart?.products.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    setQuantity(newQuantity ?? 0);
  }, [cart]);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      setUpdating(true);
      const userId: string = getUserId();
      const info = { userId, productId, quantity };
      await addToCartService(info);
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const removeProductFromCart = async (productId: string) => {
    try {
      setUpdating(true);
      const userId: string = getUserId();
      const info = { userId, productId };
      await deleteProductService(info);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove product from cart', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        console.error('Quantity must at least be one');
        return;
      }
      setUpdating(true);
      const userId: string = getUserId();
      const info = { userId, productId, quantity };
      await updateCartService(info);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update the quantity', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setUpdating(true);
      const userId: string = getUserId();
      await clearCartService(userId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to clear the cart', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const getCartTotal = async () => {
    try {
      setUpdating(true);
      const userId: string = getUserId();
      const finalTotal = await getCartTotalService(userId);
      setTotal(finalTotal);
    } catch (error) {
      console.error('Failed to get the cart total', error);
    } finally {
      setUpdating(false);
    }
  };

  const data: CartContextType = {
    cart,
    quantity,
    loading,
    updating,
    total,
    fetchCart,
    addToCart,
    removeProductFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={data}>{children}</CartContext.Provider>;
};
