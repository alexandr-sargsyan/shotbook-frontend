import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCollections, addVideoToCollection, checkVideoSaved, removeVideoFromCollection, createCollection } from '../../services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import './SaveToCollectionButton.css';

// Компонент для элемента коллекции в модальном окне
const CollectionItem = ({ collection, savedCollectionIds = [], onToggle }) => {
  const isSelected = savedCollectionIds.includes(collection.id);

  return (
    <div className="collection-item" onClick={() => onToggle(collection.id)}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(collection.id)}
        className="collection-checkbox"
      />
      <span className="collection-name">{collection.name}</span>
      {isSelected && (
        <span className="collection-added">Added</span>
      )}
    </div>
  );
};

const SaveToCollectionButton = ({ videoId, onAuthRequired, initialSaved = false, showText = true }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

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
  
  // Фильтруем коллекции по поисковому запросу
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleToggleCollection = async (collectionId) => {
    const isSelected = savedCollectionIds.includes(collectionId);
    if (isSelected) {
      await handleRemoveFromCollection(collectionId);
    } else {
      await handleAddToCollection(collectionId);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (name) => {
      const response = await createCollection({ name });
      return response.data;
    },
    onSuccess: async (data) => {
      const newCollection = data.data;
      // Добавляем видео в новую коллекцию
      await addVideoToCollection(newCollection.id, videoId);
      // Обновляем данные
      queryClient.invalidateQueries(['collections']);
      queryClient.invalidateQueries(['videoSaved', videoId]);
      setShowCreateModal(false);
      setNewCollectionName('');
      setIsSaved(true);
    },
  });

  const handleCreateCollection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newCollectionName.trim()) {
      createMutation.mutate(newCollectionName.trim());
    }
  };


  return (
    <>
      <button
        className={`save-to-collection-button ${isSaved ? 'saved' : ''} ${!showText ? 'icon-only' : ''}`}
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
        {showText && <span>Save</span>}
      </button>

      {showModal && createPortal(
        <div className="collection-modal-overlay" onClick={() => {
          setShowModal(false);
          setSearchQuery('');
        }}>
          <div className="collection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="collection-modal-header">
              <h3>Collections</h3>
              <div className="collection-modal-header-actions">
                <div className="collection-search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search collections"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <button
                  className="create-collection-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateModal(true);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Create new collection</span>
                </button>
              </div>
            </div>
            <div className="collection-modal-body">
              {isLoading ? (
                <div className="loading">Loading collections...</div>
              ) : filteredCollections.length === 0 ? (
                <div className="empty-collections">
                  <p>{searchQuery ? 'No collections found' : 'You don\'t have any collections yet'}</p>
                </div>
              ) : (
                <div className="collections-list">
                  {filteredCollections.map((collection) => (
                    <CollectionItem
                      key={collection.id}
                      collection={collection}
                      savedCollectionIds={savedCollectionIds}
                      onToggle={handleToggleCollection}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCreateModal && createPortal(
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setNewCollectionName('');
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Collection</h2>
            <form onSubmit={handleCreateCollection}>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                required
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCollectionName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SaveToCollectionButton;

