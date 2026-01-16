import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена в заголовки
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен невалиден или истек
      localStorage.removeItem('auth_token');
      // Можно добавить редирект на страницу входа, если нужно
    }
    return Promise.reject(error);
  }
);

// ==================== Аутентификация ====================

// Регистрация
export const register = async (data) => {
  return api.post('/register', data);
};

// Вход
export const login = async (data) => {
  return api.post('/login', data);
};

// Выход
export const logout = async (token) => {
  return api.post('/logout', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Получить текущего пользователя
export const getCurrentUser = async (token) => {
  return api.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Отправить код подтверждения
export const sendVerificationCode = async (data) => {
  return api.post('/email-verification/send-code', data);
};

// Проверить код подтверждения
export const verifyCode = async (data) => {
  return api.post('/email-verification/verify-code', data);
};

// ==================== Лайки ====================

// Переключить лайк
export const toggleLike = async (videoId) => {
  const response = await api.post(`/video-references/${videoId}/like`);
  // Преобразуем ответ в формат, который ожидает компонент
  return {
    data: {
      liked: response.data.liked, // Исправлено: было is_liked, должно быть liked
      likes_count: response.data.likes_count,
    },
  };
};

// Проверить лайк
export const checkLike = async (videoId) => {
  return api.get(`/video-references/${videoId}/like`);
};

// Получить все лайки пользователя
export const getUserLikes = async () => {
  return api.get('/likes');
};

// ==================== Каталоги ====================

// Получить все каталоги
export const getCollections = async () => {
  return api.get('/collections');
};

// Создать каталог
export const createCollection = async (data) => {
  return api.post('/collections', data);
};

// Получить каталог по ID
export const getCollection = async (id) => {
  return api.get(`/collections/${id}`);
};

// Обновить каталог
export const updateCollection = async (id, data) => {
  return api.put(`/collections/${id}`, data);
};

// Удалить каталог
export const deleteCollection = async (id) => {
  return api.delete(`/collections/${id}`);
};

// Получить видео в каталоге
export const getCollectionVideos = async (collectionId) => {
  return api.get(`/collections/${collectionId}/videos`);
};

// Добавить видео в каталог
export const addVideoToCollection = async (collectionId, videoId) => {
  return api.post(`/collections/${collectionId}/videos`, {
    video_reference_id: videoId,
  });
};

// Удалить видео из каталога
export const removeVideoFromCollection = async (collectionId, videoId) => {
  return api.delete(`/collections/${collectionId}/videos/${videoId}`);
};

// Проверить, сохранено ли видео в каталогах
export const checkVideoSaved = async (videoId) => {
  return api.get(`/video-references/${videoId}/saved`);
};

// Получить расшаренную коллекцию по токену (публичный роут)
export const getSharedCollection = async (token) => {
  return api.get(`/shared/collections/${token}/videos`);
};

// ==================== Профиль ====================

// Получить профиль
export const getProfile = async () => {
  return api.get('/profile');
};

// Обновить профиль
export const updateProfile = async (data) => {
  return api.put('/profile', data);
};

// ==================== Видео (существующие методы) ====================

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

// Get all tags with optional search
export const getTags = async (search = '') => {
  const params = {};
  if (search) {
    params.search = search;
  }
  return api.get('/tags', { params });
};

export default api;
