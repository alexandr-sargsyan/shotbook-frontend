import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollections, createCollection, deleteCollection } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Collections.css';

const Collections = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const { data: collectionsData, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await getCollections();
      return response.data;
    },
    enabled: isAuthenticated(),
  });

  const createMutation = useMutation({
    mutationFn: async (name) => {
      const response = await createCollection({ name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      setShowCreateModal(false);
      setNewCollectionName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteCollection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
    },
  });

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  const collections = collectionsData?.data || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createMutation.mutate(newCollectionName.trim());
    }
  };

  const handleDelete = (id, isDefault) => {
    if (isDefault) {
      alert('Нельзя удалить каталог по умолчанию');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить этот каталог?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="collections-page">
      <div className="collections-container">
        <div className="collections-header">
          <h1>Мои каталоги</h1>
          <button
            className="create-collection-button"
            onClick={() => setShowCreateModal(true)}
          >
            + Создать каталог
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Загрузка...</div>
        ) : collections.length === 0 ? (
          <div className="empty-collections">
            <p>У вас пока нет каталогов</p>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="collection-card"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <h3>{collection.name}</h3>
                {collection.is_default && (
                  <span className="default-badge">По умолчанию</span>
                )}
                <p className="collection-count">
                  {collection.video_references_count || 0} видео
                </p>
                {!collection.is_default && (
                  <button
                    className="delete-collection-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection.id, collection.is_default);
                    }}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Создать каталог</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Название каталога"
                required
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCollectionName('');
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;

