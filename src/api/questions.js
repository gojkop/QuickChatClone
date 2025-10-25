import xano from '@/api/xano';

export async function fetchQuestions() {
  try {
    const response = await xano.get('/questions');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
}