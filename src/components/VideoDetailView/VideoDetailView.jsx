import React from 'react';
import UnifiedVideoPlayer from '../VideoPlayer/UnifiedVideoPlayer';
import './VideoDetailView.css';

const VideoDetailView = ({ video }) => {
  if (!video) {
    return <div className="video-detail-loading">Loading...</div>;
  }

  return (
    <div className="video-detail-view">
      <div className="video-player-container">
        {video.platform && video.platform_video_id ? (
          <UnifiedVideoPlayer
            platform={video.platform}
            platformVideoId={video.platform_video_id}
            sourceUrl={video.source_url}
            autoplay={true}
            muted={true}
            loop={false}
          />
        ) : video.preview_url ? (
          <img src={video.preview_url} alt={video.title} className="video-preview-image" />
        ) : (
          <div className="video-placeholder-large">
            <span className="video-icon-large">🎬</span>
            <p>Video not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetailView;

