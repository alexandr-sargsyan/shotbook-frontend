import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCollections, addVideoToCollection, checkVideoSaved, removeVideoFromCollection } from '../../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import './SaveToCollectionButton.css';

// Компонент для элемента каталога в модальном окне
const CollectionItemButton = ({ collection, videoId, savedCollectionIds = [], onAdd, onRemove }) => {
  const hasVideo = savedCollectionIds.includes(collection.id);

  return (
    <button
      className={`collection-item ${hasVideo ? 'has-video' : ''}`}
      onClick={() => hasVideo ? onRemove(collection.id) : onAdd(collection.id)} // Передаем collection.id
    >
      <span className="collection-name">{collection.name}</span>
      {collection.is_default && (
        <span className="collection-badge">Default</span>
      )}
      {hasVideo && (
        <span className="collection-saved-badge">✓ Saved</span>
      )}
      {collection.video_references_count > 0 && (
        <span className="collection-count">
          {collection.video_references_count} videos
        </span>
      )}
    </button>
  );
};

const SaveToCollectionButton = ({ videoId, onAuthRequired, initialSaved = false }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);

  // Проверяем, сохранено ли видео в каталогах
  const { data: savedData } = useQuery({
    queryKey: ['videoSaved', videoId],
    queryFn: async () => {
      const response = await checkVideoSaved(videoId);
      return response.data;
    },
    enabled: isAuthenticated(),
    refetchOnWindowFocus: false,
  });

  // Обновляем состояние isSaved при получении данных
  useEffect(() => {
    if (savedData?.is_saved !== undefined) {
      setIsSaved(savedData.is_saved);
    }
  }, [savedData]);

  const savedCollectionIds = savedData?.collection_ids || [];

  const { data: collectionsData, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await getCollections();
      return response.data;
    },
    enabled: isAuthenticated() && showModal,
  });

  const collections = collectionsData?.data || [];

  const handleClick = (e) => {
    e.stopPropagation();

    if (!isAuthenticated()) {
      onAuthRequired?.();
      return;
    }

    // Обновляем данные о сохраненности при открытии модалки
    queryClient.invalidateQueries(['videoSaved', videoId]);
    setShowModal(true);
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      await addVideoToCollection(collectionId, videoId);
      setIsSaved(true);
      queryClient.invalidateQueries(['videoSaved', videoId]);
      queryClient.invalidateQueries(['collections']);
      // Не закрываем модалку, чтобы можно было добавить в другие каталоги
    } catch (error) {
      // Если видео уже в каталоге (422), просто игнорируем - ничего не делаем
      if (error.response?.status === 422) {
        // Видео уже в каталоге - обновляем данные, но не показываем ошибку
        queryClient.invalidateQueries(['videoSaved', videoId]);
        queryClient.invalidateQueries(['collections']);
        return;
      }
      // Для других ошибок только логируем в консоль
      console.error('Error adding to collection:', error);
    }
  };

  const handleRemoveFromCollection = async (collectionId) => {
    try {
      await removeVideoFromCollection(collectionId, videoId);
      // Проверяем, осталось ли видео в других каталогах
      const response = await checkVideoSaved(videoId);
      setIsSaved(response.data.is_saved);
      queryClient.invalidateQueries(['videoSaved', videoId]);
      queryClient.invalidateQueries(['collections']);
      // Не закрываем модалку, чтобы пользователь мог удалить из других каталогов
    } catch (error) {
      // Только логируем ошибку, не показываем alert
      console.error('Error removing from collection:', error);
    }
  };


  return (
    <>
      <button
        className={`save-to-collection-button ${isSaved ? 'saved' : ''}`}
        onClick={handleClick}
        title={isSaved ? 'Video saved in collection' : 'Save to collection'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isSaved ? '#3b82f6' : 'none'}
          stroke={isSaved ? '#3b82f6' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Save</span>
      </button>

      {showModal && (
        <div className="collection-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="collection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="collection-modal-header">
              <h3>Select Collection</h3>
              <button className="collection-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="collection-modal-body">
              {isLoading ? (
                <div className="loading">Loading collections...</div>
              ) : collections.length === 0 ? (
                <div className="empty-collections">
                  <p>You don't have any collections yet</p>
                  <a href="/collections" className="create-collection-link">
                    Create Collection
                  </a>
                </div>
              ) : (
                <div className="collections-list">
                  {collections.map((collection) => (
                    <CollectionItemButton
                      key={collection.id}
                      collection={collection}
                      videoId={videoId}
                      savedCollectionIds={savedCollectionIds}
                      onAdd={handleAddToCollection}
                      onRemove={handleRemoveFromCollection}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveToCollectionButton;

