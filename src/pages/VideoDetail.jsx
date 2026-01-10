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

  const video = videoData?.data;

  if (isLoading) {
    return (
      <div className="video-detail-page loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-detail-page error">
        <div className="error-message">Video not found</div>
        <button onClick={() => navigate('/')} className="back-button">
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      <div className="video-detail-container">
        <div className="video-detail-main">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          {video.source_url && (
            <a
              href={video.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="open-button"
            >
              Open →
            </a>
          )}
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

