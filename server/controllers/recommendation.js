import HttpError from '../models/http-error.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { limit } = req.query;

    const url = new URL(`/recommendations/${userId}`, process.env.AI_SERVICE_URL);
    if (limit) {
      url.searchParams.set('limit', limit);
    }

    const response = await fetch(url);
    if (!response.ok) {
      return next(new HttpError('Failed to fetch recommendations', 502));
    }

    const data = await response.json();
    res.status(200).json({ recommendations: data.recommendations });
  } catch (error) {
    return next(new HttpError('Failed to fetch recommendations', 500));
  }
};
