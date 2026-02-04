import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toggleLike } from '../../services/api';
import './LikeButton.css';

const LikeButton = ({ videoId, initialLiked = false, initialLikesCount = 0, onAuthRequired }) => {
  const { isAuthenticated, setPendingAction, executePendingAction } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  // Синхронизируем состояние с пропсами, если они изменяются
  useEffect(() => {
    setLiked(initialLiked);
    setLikesCount(initialLikesCount);
  }, [initialLiked, initialLikesCount]);

  // Выполняем pending action после авторизации
  useEffect(() => {
    if (isAuthenticated()) {
      const pendingAction = setPendingAction ? null : null; // Получаем через getAndClearPendingAction
      // Это будет обработано в родительском компоненте через callback
    }
  }, [isAuthenticated]);

  const handleClick = async (e) => {
    e.stopPropagation(); // Предотвращаем клик по карточке видео

    if (!isAuthenticated()) {
      // Сохраняем pending action
      if (setPendingAction) {
        setPendingAction({ type: 'like', videoId });
      }
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    try {
      const response = await toggleLike(videoId);
      setLiked(response.data.liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="like-button-wrapper">
      <button
        className={`like-button ${liked ? 'liked' : ''} ${loading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={loading}
        title={!isAuthenticated() ? 'Sign in to like videos' : loading ? 'Loading...' : liked ? 'Unlike' : 'Like'}
      >
        {loading ? (
          <span className="like-spinner">⟳</span>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={liked ? '#FF3040' : 'none'}
            stroke={liked ? '#FF3040' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        )}
      </button>
      <span className={`like-count ${likesCount > 0 ? 'visible' : 'hidden'}`}>{likesCount || 0}</span>
    </div>
  );
};

export default LikeButton;

