import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollection, getCollectionVideos, removeVideoFromCollection } from '../services/api';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import './CollectionDetail.css';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: collectionData, isLoading: collectionLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const response = await getCollection(id);
      return response.data;
    },
    enabled: isAuthenticated() && !!id,
  });

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['collectionVideos', id],
    queryFn: async () => {
      const response = await getCollectionVideos(id);
      return response.data;
    },
    enabled: isAuthenticated() && !!id,
  });

  const removeMutation = useMutation({
    mutationFn: async (videoId) => {
      await removeVideoFromCollection(id, videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collectionVideos', id]);
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

  const collection = collectionData?.data;
  const videos = videosData?.data || [];

  if (collectionLoading) {
    return (
      <div className="collection-detail-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="collection-detail-page">
        <div className="error">Каталог не найден</div>
        <button onClick={() => navigate('/collections')} className="back-button">
          Назад к каталогам
        </button>
      </div>
    );
  }

  return (
    <div className="collection-detail-page">
      <div className="collection-detail-container">
        <div className="collection-detail-header">
          <button className="back-button" onClick={() => navigate('/collections')}>
            ← Назад
          </button>
          <div className="collection-info">
            <h1>{collection.name}</h1>
            {collection.is_default && (
              <span className="default-badge">По умолчанию</span>
            )}
            <p className="collection-count">{videos.length} видео</p>
          </div>
        </div>

        <div className="collection-videos">
          {videosLoading ? (
            <div className="loading">Загрузка видео...</div>
          ) : videos.length === 0 ? (
            <div className="empty-videos">
              <p>В этом каталоге пока нет видео</p>
            </div>
          ) : (
            <VideoGrid videos={videos} loading={videosLoading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;

