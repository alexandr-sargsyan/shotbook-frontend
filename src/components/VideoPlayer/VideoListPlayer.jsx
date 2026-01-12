import React from 'react';
import { usePlatformPlayer } from './usePlatformPlayer';
import './VideoListPlayer.css';

/**
 * Компонент для отображения видео в списке (каталоге)
 * 
 * Особенности:
 * - Автоплей только при видимости (lazy loading)
 * - Без звука (muted)
 * - С зацикливанием (loop)
 * - Без контролов (controls)
 */
const VideoListPlayer = ({ 
  platform, 
  platformVideoId, 
  sourceUrl,
  isVisible = false 
}) => {
  const { renderPlayer } = usePlatformPlayer(platform, platformVideoId, sourceUrl);

  return (
    <div className="video-list-player">
      <div className="video-container">
        {renderPlayer({
          autoplay: isVisible,  // Только если видно в viewport
          muted: true,           // Без звука
          loop: true,            // С зацикливанием
          controls: false,       // Без контролов
          showText: false,       // Для Facebook: не показывать текст поста в списке
        })}
      </div>
    </div>
  );
};

VideoListPlayer.displayName = 'VideoListPlayer';

export default VideoListPlayer;

