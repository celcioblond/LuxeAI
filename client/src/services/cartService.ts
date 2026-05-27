import api from "./api";

interface infoCart {
  userId: string;
  productId: string;
  quantity: number;
}

interface userProduct {
  userId: string;
  productId: string;
}

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

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const getCartService = async (userId: string): Promise<Cart> => {
  try {
    const response = await api.get(`/api/cart/getCart/${userId}`);
    return response.data.cart;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const addToCartService = async (info: infoCart) => {
  try {
    const response = await api.post(`/api/cart/addToCart`, info);
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const updateCartService = async (info: infoCart): Promise<Cart> => {
  const { userId, ...body } = info;
  try {
    const response = await api.patch(`/api/cart/updateCart/${userId}`, body);
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const deleteProductService = async (info: userProduct) => {
  const { userId, productId } = info;
  try {
    const response = await api.delete(`/api/cart/deleteProduct/${userId}/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const getCartTotalService = async (userId: string): Promise<number> => {
  try {
    const response = await api.get(`/api/cart/total/${userId}`);
    return response.data.cartTotal;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const clearCartService = async (userId: string) => {
  try {
    const response = await api.delete(`/api/cart/clearCart/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};
