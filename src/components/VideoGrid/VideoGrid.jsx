import React from 'react';
import VideoCard from '../VideoCard/VideoCard';
import './VideoGrid.css';

const VideoGrid = ({ videos = [], loading = false, onAuthRequired, queryParams = {}, pagination = {} }) => {
  if (loading) {
    return (
      <div className="video-grid loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-grid empty">
        <div className="empty-message">No videos found</div>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video, index) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onAuthRequired={onAuthRequired}
          videoList={{ videos, queryParams, pagination }}
          currentIndex={index}
        />
      ))}
    </div>
  );
};

export default VideoGrid;

