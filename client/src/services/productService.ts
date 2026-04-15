import axios from "axios";

const BACK_URL = import.meta.env.VITE_API_URL;

export const getProducts = async () => {
  try {
    const response = await axios.get(`${BACK_URL}/api/products`);
    return response.data;
  } catch(error: any) {
    throw new Error(`Error: ${error.message}`)
  }
}

export const getProduct = async(id: string) => {
  try {
    const response = await axios.get(`${BACK_URL}/api/products/${id}`);
    return response.data;
  } catch(error: any) {
    throw new Error(`Error: ${error.message}`)
  }
}
