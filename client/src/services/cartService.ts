import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_API_URL;

interface infoCart{
  userId: string;
  productId: string;
  quantity: number;
}


interface userProduct{
  userId: string;
  productId: string;
}

interface CartProduct{
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

export const getCartService = async(userId: string): Promise<Cart> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/getCart/${userId}`);
    return response.data;
  } catch(error) {
    throw new Error(`${error.message}`);
  }
}

export const addToCartService = async(info: infoCart) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/addToCart`, info);
    return response.data;
  } catch(error) {
    throw new Error(`${error.message}`);
  }
}

export const updateCartService = async(info: infoCart): Promise<Cart> => {
  const {userId, ...body} = info;
  try {
    const response = await axios.put(`${BACKEND_URL}/updateCart/${userId}`, body);
    return response.data;
  } catch(error) {
    throw new Error(`${error.message}`);
  }
}

export const deleteProductService = async(info: userProduct) => {
  const {userId, productId} = info;
  try {
    const response = await axios.delete(`${BACKEND_URL}/deleteProduct/${userId}/${productId}`);
    return response.data; 
  } catch(error) {
    throw new Error(`${error.message}`);
  }
}

export const getCartTotalService = async(userId: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/total/${userId}`);
    return response.data;
  } catch(error) {
    throw new Error(`${error.message}`);
  }
}

export const clearCartService = async(userId: string) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/clearCart/${userId}`);
    return response.data;
  } catch(error){
    throw new Error(`${error.message}`);
  }
}