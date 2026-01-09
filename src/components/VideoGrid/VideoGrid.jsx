import React from 'react';
import VideoCard from '../VideoCard/VideoCard';
import './VideoGrid.css';

const VideoGrid = ({ videos = [], loading = false }) => {
  if (loading) {
    return (
      <div className="video-grid loading">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-grid empty">
        <div className="empty-message">Видео не найдены</div>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;

