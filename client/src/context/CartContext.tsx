import { createContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { addToCartService, deleteProductService, getCartService, updateCartService } from '../services/cartService';

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
  cart: Cart || null;
  quantity: number;
  loading: boolean;
  total: number;
  fetchCart: () => void;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeProductFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  const { user, getUserId, isAuthenticated } = useAuth();

  //Get cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const response = await getCartService(userId);
      setCart(response);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

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

  const addToCart = async(productId: string, quantity: number) => {
    try {
      setLoading(true);
      const userId: string = getUserId();
      const info = { userId, productId, quantity };
      await addToCartService(info);
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart", error);
    } finally {
      setLoading(false);
    }
  }

  const removeProductFromCart = async(productId: string) => {
    try {
      setLoading(true);
      const userId: string = getUserId();
      const info = {userId, productId};
      await deleteProductService(info);
      await fetchCart();
    } catch(error) {
      console.error("Failed to remove product from cart", error);
    } finally {
      setLoading(false);
    }
  }

  const updateQuantity = async(productId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        console.error("Quantity must at least be one");
        return;
      }
      setLoading(true);
      const userId: string = getUserId();
      const info = {userId, productId, quantity};
      await updateCartService(info);
      await fetchCart();
    } catch(error) {
      console.error("Failed to update the quantity", error);
    } finally {
      setLoading(false);
    }
  }

    const data: CartContextType = {
    cart,
    quantity,
    loading,
    total,
    fetchCart,
    addToCart,
    removeProductFromCart,
    updateQuantity,
  }; 

  return <CartContext.Provider value={data}>{children}</CartContext.Provider>;
};
