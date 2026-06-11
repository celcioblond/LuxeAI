import api from './api';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CreateOrderPayload {
  firstName: string;
  lastName: string;
  shippingAddress: ShippingAddress;
}

interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  subtotal: number;
}

interface OrderTotalAmount {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface Order {
  _id: string;
  customer: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  totalAmount: OrderTotalAmount;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripeInfo: {
    paymentIntentId: string;
    clientSecret: string;
    paymentStatus: string;
    paidAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateOrderResponse {
  orderId: string;
  clientSecret: string;
}

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createOrderService = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
  try {
    const response = await api.post('/api/orders', payload);
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const getMyOrdersService = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/api/orders/me');
    return response.data.orders;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const getOrderByIdService = async (id: string): Promise<Order> => {
  try {
    const response = await api.get(`/api/orders/${id}`);
    return response.data.order;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

interface AdminOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export const getAllOrdersService = async (page = 1): Promise<AdminOrdersResponse> => {
  try {
    const response = await api.get('/api/admin/orders', { params: { page } });
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const updateOrderStatusService = async (id: string, status: Order['status']): Promise<Order> => {
  try {
    const response = await api.patch(`/api/admin/orders/${id}/status`, { status });
    return response.data.order;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};
