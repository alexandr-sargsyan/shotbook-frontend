import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return '▶️';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      default:
        return '🎬';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    navigate(`/video/${video.id}`);
  };

  return (
    <div className="video-card" onClick={handleClick}>
      <div className="video-preview">
        {video.preview_url ? (
          <img src={video.preview_url} alt={video.title} />
        ) : (
          <div className="video-placeholder">
            <span className="video-icon">{getPlatformIcon(video.platform)}</span>
          </div>
        )}
        {video.duration_sec && (
          <div className="video-duration">{formatDuration(video.duration_sec)}</div>
        )}
        <div className="video-platform">{getPlatformIcon(video.platform)}</div>
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        {video.category && (
          <span className="video-category">{video.category.name}</span>
        )}
        {video.public_summary && (
          <p className="video-summary">{video.public_summary}</p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;

