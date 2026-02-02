import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollections, createCollection, deleteCollection, updateCollection } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Collections.css';

const Collections = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editCollectionName, setEditCollectionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      setOpenMenuId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const response = await updateCollection(id, { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      setShowEditModal(false);
      setEditingCollection(null);
      setEditCollectionName('');
      setOpenMenuId(null);
    },
  });

  // Закрытие меню при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      // Не закрывать если клик по меню или кнопке меню
      if (e.target.closest('.collection-menu') || e.target.closest('.collection-menu-button')) {
        return;
      }
      setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  const allCollections = collectionsData?.data || [];

  // Фильтрация коллекций по поисковому запросу
  const collections = allCollections.filter((collection) => {
    if (!searchQuery.trim()) {
      return true;
    }
    const query = searchQuery.toLowerCase().trim();
    return collection.name.toLowerCase().includes(query);
  });

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
      setOpenMenuId(null);
      deleteMutation.mutate(id);
    }
  };

  const handleShare = (e, collection) => {
    e.stopPropagation();
    setSelectedCollection(collection);
    setShowShareModal(true);
    setOpenMenuId(null);
  };


  const getShareUrl = (shareToken) => {
    return `${window.location.origin}/shared/collection/${shareToken}`;
  };

  const handleCopyLink = () => {
    if (selectedCollection?.share_token) {
      const shareUrl = getShareUrl(selectedCollection.share_token);
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      });
    }
  };

  const handleMenuToggle = (e, collectionId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === collectionId ? null : collectionId);
  };

  const handleEdit = (e, collection) => {
    e.stopPropagation();
    setEditingCollection(collection);
    setEditCollectionName(collection.name);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (editingCollection && editCollectionName.trim()) {
      updateMutation.mutate({
        id: editingCollection.id,
        name: editCollectionName.trim(),
      });
    }
  };

  const handleDeleteFromMenu = (e, collection) => {
    e.stopPropagation();
    e.preventDefault();
    handleDelete(collection.id, collection.is_default);
  };

  return (
    <div className="collections-page">
      <div className="collections-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="collections-header">
          <h1>My Collections</h1>
          <div className="collections-header-center">
            <input
              type="text"
              className="collections-search-input"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="create-collection-button"
            onClick={() => setShowCreateModal(true)}
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? 'Creating...' : '+ Create Collection'}
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="empty-collections">
            <p>
              {searchQuery.trim()
                ? 'No collections found matching your search'
                : "You don't have any collections yet"}
            </p>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="collection-card"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <button
                  className="collection-menu-button"
                  onClick={(e) => handleMenuToggle(e, collection.id)}
                  title="Menu"
                >
                  ⋯
                </button>
                {openMenuId === collection.id && (
                  <div className="collection-menu" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="menu-item"
                      onClick={(e) => handleShare(e, collection)}
                      disabled={deleteMutation.isLoading || updateMutation.isLoading}
                    >
                      Share
                    </button>
                    <button
                      className="menu-item"
                      onClick={(e) => handleEdit(e, collection)}
                      disabled={deleteMutation.isLoading || updateMutation.isLoading}
                    >
                      Edit
                    </button>
                    {!collection.is_default && (
                      <button
                        className="menu-item menu-item-danger"
                        onClick={(e) => handleDeleteFromMenu(e, collection)}
                        disabled={deleteMutation.isLoading || updateMutation.isLoading}
                      >
                        {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                )}
                <div className="collection-content">
                  <h3 className="collection-name" title={collection.name}>
                    {collection.name}
                  </h3>
                  {collection.is_default && (
                    <span className="default-badge">Default</span>
                  )}
                  <p className="collection-count">
                    {collection.video_references_count || 0} videos
                  </p>
                </div>
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

      {showShareModal && selectedCollection && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Share Collection</h2>
            <p style={{ marginBottom: '16px', color: 'var(--color-text-dim)' }}>
              Share this collection with others by sending them this link:
            </p>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={getShareUrl(selectedCollection.share_token)}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                }}
              />
              {copySuccess && (
                <div
                  style={{
                    marginTop: '8px',
                    color: 'var(--color-accent)',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Copied
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                }}
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedCollection(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingCollection && (
        <div className="modal-overlay" onClick={() => {
          setShowEditModal(false);
          setEditingCollection(null);
          setEditCollectionName('');
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Collection</h2>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                value={editCollectionName}
                onChange={(e) => setEditCollectionName(e.target.value)}
                placeholder="Collection name"
                required
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit" disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCollection(null);
                    setEditCollectionName('');
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

