export const syncRecommendations = () => {
  try {
    const url = new URL('/recommendations/sync', process.env.AI_SERVICE_URL);
    fetch(url, { method: 'POST' }).catch((error) => {
      console.error('Failed to sync recommendations:', error.message);
    });
  } catch (error) {
    console.error('Failed to sync recommendations:', error.message);
  }
};
