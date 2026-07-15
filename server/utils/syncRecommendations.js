// Fire-and-forget: tell the AI service to re-embed the catalog after a product
// change. Never awaited, so a slow or down AI service never blocks or breaks the
// product request.
export const syncRecommendations = () => {
  try {
    const url = new URL('/sync', process.env.AI_SERVICE_URL);
    fetch(url, { method: 'POST' }).catch((error) => {
      console.error('Failed to sync recommendations:', error.message);
    });
  } catch (error) {
    console.error('Failed to sync recommendations:', error.message);
  }
};
