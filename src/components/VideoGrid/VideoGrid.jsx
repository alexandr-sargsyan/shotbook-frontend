import React from 'react';
import VideoCard from '../VideoCard/VideoCard';
import './VideoGrid.css';

const VideoGrid = ({
  videos = [],
  loading = false,
  onAuthRequired,
  queryParams = {},
  pagination = {},
  viewMode = 'grid'
}) => {
  if (loading) {
    return (
      <div className="video-grid loading">
        <div className="loading-spinner">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
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
    <div className={`video-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          onAuthRequired={onAuthRequired}
          videoList={{ videos, queryParams, pagination }}
          currentIndex={index}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
