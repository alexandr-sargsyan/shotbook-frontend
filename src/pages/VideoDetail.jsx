import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VideoDetailView from '../components/VideoDetailView/VideoDetailView';
import VideoDetailSidebar from '../components/VideoDetailSidebar/VideoDetailSidebar';
import { getVideoReference } from '../services/api';
import './VideoDetail.css';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: videoData, isLoading } = useQuery({
    queryKey: ['videoReference', id],
    queryFn: async () => {
      const response = await getVideoReference(id);
      return response.data;
    },
    enabled: !!id,
  });

  const video = videoData;

  if (isLoading) {
    return (
      <div className="video-detail-page loading">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-detail-page error">
        <div className="error-message">Видео не найдено</div>
        <button onClick={() => navigate('/')} className="back-button">
          Вернуться к каталогу
        </button>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Назад
      </button>
      <div className="video-detail-container">
        <div className="video-detail-main">
          <VideoDetailView video={video} />
        </div>
        <div className="video-detail-sidebar-wrapper">
          <VideoDetailSidebar video={video} />
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;

