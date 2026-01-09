import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Search video references with filters
export const searchVideoReferences = async (query = '', filters = {}) => {
  const params = {
    ...filters,
  };
  
  if (query) {
    params.search = query;
  }
  
  return api.get('/video-references', { params });
};

// Get single video reference by ID
export const getVideoReference = async (id) => {
  return api.get(`/video-references/${id}`);
};

// Get all categories
export const getCategories = async () => {
  return api.get('/categories');
};

// Get single category by ID
export const getCategory = async (id) => {
  return api.get(`/categories/${id}`);
};

// Get all tags
export const getTags = async () => {
  return api.get('/tags');
};

export default api;

