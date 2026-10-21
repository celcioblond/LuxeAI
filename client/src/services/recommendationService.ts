import api from './api';
import { toMessage } from './errors';

export const getRecommendations = async () => {
  try {
    const response = await api.get('/api/recommendations');
    return response.data.recommendations;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};
