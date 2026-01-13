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
      alert('Cannot delete default collection');
      return;
    }
    if (window.confirm('Are you sure you want to delete this collection?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="collections-page">
      <div className="collections-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="collections-header">
          <h1>My Collections</h1>
          <button
            className="create-collection-button"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Collection
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="empty-collections">
            <p>You don't have any collections yet</p>
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
                  <span className="default-badge">Default</span>
                )}
                <p className="collection-count">
                  {collection.video_references_count || 0} videos
                </p>
                {!collection.is_default && (
                  <button
                    className="delete-collection-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection.id, collection.is_default);
                    }}
                  >
                    Delete
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
            <h2>Create Collection</h2>
            <form onSubmit={handleCreate}>
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
        </div>
      )}
    </div>
  );
};

export default Collections;

