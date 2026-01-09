import React, { useState } from 'react';
import './VideoOverlay.css';

const VideoOverlay = ({ platform }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlay = () => {
    setIsPlaying(true);
    // Логика запуска через API платформы будет добавлена позже
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Логика паузы через API платформы будет добавлена позже
  };

  const handleMute = () => {
    setIsMuted(true);
    // Логика выключения звука будет добавлена позже
  };

  const handleUnmute = () => {
    setIsMuted(false);
    // Логика включения звука будет добавлена позже
  };

  // Для Instagram не показываем overlay, так как у него свой интерфейс
  if (platform === 'instagram') {
    return null;
  }

  return (
    <div className="video-overlay">
      {!isPlaying && (
        <button className="play-button" onClick={handlePlay}>
          ▶
        </button>
      )}
      {isPlaying && (
        <button className="pause-button" onClick={handlePause}>
          ⏸
        </button>
      )}
      <button 
        className="mute-button" 
        onClick={isMuted ? handleUnmute : handleMute}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default VideoOverlay;

