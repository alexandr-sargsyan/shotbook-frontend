import React from 'react';
import './VideoDetailView.css';

const VideoDetailView = ({ video }) => {
  if (!video) {
    return <div className="video-detail-loading">Загрузка...</div>;
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return '▶️ YouTube';
      case 'instagram':
        return '📷 Instagram';
      case 'tiktok':
        return '🎵 TikTok';
      default:
        return '🎬';
    }
  };

  return (
    <div className="video-detail-view">
      <div className="video-player-container">
        {video.preview_embed ? (
          <div
            className="video-embed"
            dangerouslySetInnerHTML={{ __html: video.preview_embed }}
          />
        ) : video.preview_url ? (
          <img src={video.preview_url} alt={video.title} className="video-preview-image" />
        ) : (
          <div className="video-placeholder-large">
            <span className="video-icon-large">{getPlatformIcon(video.platform)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetailView;

