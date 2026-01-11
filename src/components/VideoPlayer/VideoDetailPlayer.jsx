import React from 'react';
import { usePlatformPlayer } from './usePlatformPlayer';
import './VideoDetailPlayer.css';

/**
 * Компонент для отображения видео на детальной странице
 * 
 * Особенности:
 * - Всегда автоплей
 * - Со звуком (unmuted)
 * - Без зацикливания
 * - С контролами
 */
const VideoDetailPlayer = ({ 
  platform, 
  platformVideoId, 
  sourceUrl 
}) => {
  const { renderPlayer } = usePlatformPlayer(platform, platformVideoId, sourceUrl);

  return (
    <div className="video-detail-player">
      <div className="video-container">
        {renderPlayer({
          autoplay: true,        // Всегда автоплей
          muted: false,          // Со звуком
          loop: false,           // Без зацикливания
          controls: true,        // С контролами
        })}
      </div>
    </div>
  );
};

VideoDetailPlayer.displayName = 'VideoDetailPlayer';

export default VideoDetailPlayer;

