import React from 'react';
import './VideoOverlay.css';

const VideoOverlay = ({ 
  platform, 
  isPlaying = false, 
  isMuted = true,
  onPlay,
  onPause,
  onToggleMute,
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

  const handleMuteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Для звука не перезапускаем видео
    if (onToggleMute) {
      onToggleMute();
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
      <button 
        className="mute-button" 
        onClick={handleMuteClick}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default VideoOverlay;

