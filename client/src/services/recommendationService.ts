import api from './api';

export const getRecommendations = async () => {
  try {
    const response = await api.get('/api/recommendations');
    return response.data.recommendations;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};
