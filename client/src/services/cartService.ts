import axios, {AxiosError} from "axios";
const BACKEND_API = import.meta.env.VITE_API_URL;

interface CartResponse{
  userId: string;
  products: string[];
}

const cartService = async() => {
  try { 
    const response = await axios.post<CartResponse>(
      `${BACKEND_API}`}
    )
  } catch(error) {
    const err = error as AxiosError<{message?: string}>;

  }
}

export default cartService;