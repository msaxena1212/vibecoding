import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Mock data (fallback in case API calls fail)
const mockCharacters = [
  { id: 1, name: 'Shinchan', description: 'The mischievous star!', imageUrl: '/assets/shinchan.png' },
  { id: 2, name: 'Doraemon', description: 'The gadget-filled cat!', imageUrl: '/assets/doraemon.png' },
];

const mockEpisodes = [
  { id: 1, title: 'Shinchan Episode 1', description: 'A classic Shinchan episode.', imageUrl: '/assets/shinchan_episode1.png' },
  { id: 2, title: 'Doraemon Episode 1', description: 'A timeless Doraemon adventure.', imageUrl: '/assets/doraemon_episode1.png' },
];


const api = {
  async getCharacters() {
    try {
      const response = await axios.get(`${API_BASE_URL}/characters`);
      return response.data;
    } catch (error) {
      console.error('Error fetching characters:', error);
      return mockCharacters; // Fallback to mock data
    }
  },

  async getEpisodes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/episodes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching episodes:', error);
      return mockEpisodes; // Fallback to mock data
    }
  },

  async submitScore(scoreData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/scores`, scoreData);
      return response.data;
    } catch (error) {
      console.error('Error submitting score:', error);
      return { success: false, message: 'Failed to submit score.' };
    }
  },
};

export default api;