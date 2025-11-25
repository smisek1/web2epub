import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Get all articles
export const getArticles = async () => {
  const response = await api.get('/articles');
  return response.data;
};

// Move articles to trash
export const moveToTrash = async (articleIds) => {
  const response = await api.post('/articles/trash', { ids: articleIds });
  return response.data;
};

// Create book from articles
export const createBook = async (articleIds) => {
  const response = await api.post('/books/create', 
    { ids: articleIds },
    { 
      responseType: 'blob',
      timeout: 120000 // 2 minutes for book creation
    }
  );
  return response;
};

// Load articles from sites
export const loadArticles = async () => {
  const response = await api.post('/articles/load');
  return response.data;
};

export default api;

