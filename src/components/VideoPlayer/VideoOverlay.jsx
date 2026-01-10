import React from 'react';
import './VideoOverlay.css';

const VideoOverlay = ({ 
  platform, 
  isPlaying = false, 
  onPlay,
  onPause,
}) => {
  // Для Instagram не показываем overlay, так как у него свой интерфейс
  if (platform === 'instagram') {
    return null;
  }

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    }
  };

  const handlePauseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPause) {
      onPause();
    }
  };

  return (
    <div className="video-overlay">
      {!isPlaying && (
        <button className="play-button" onClick={handlePlayClick}>
          ▶
        </button>
      )}
      {isPlaying && (
        <button className="pause-button" onClick={handlePauseClick}>
          ⏸
        </button>
      )}
    </div>
  );
};

export default VideoOverlay;
