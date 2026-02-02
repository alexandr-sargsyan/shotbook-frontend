import React from 'react';
import { usePlatformPlayer } from './usePlatformPlayer';
import './VideoListPlayer.css';

/**
 * Компонент для отображения видео в списке (каталоге)
 * 
 * Особенности:
 * - Автозапуск для всех платформ кроме Instagram (при появлении в viewport)
 * - Lazy loading (загрузка при появлении в viewport)
 * - Без звука (muted) для всех платформ кроме TikTok
 * - С зацикливанием (loop)
 * - С контролами для YouTube и TikTok (как в детальном виде)
 */
const VideoListPlayer = ({
  platform,
  platformVideoId,
  sourceUrl,
  isVisible = false,
  isPlaying = false // New prop to force play/interaction
}) => {
  const { renderPlayer } = usePlatformPlayer(platform, platformVideoId, sourceUrl);

  // Включаем контролы для YouTube и TikTok (как в детальном виде)
  // Instagram не поддерживает программное управление controls
  // Facebook использует свой встроенный плеер с контролами

  // Автозапуск для всех платформ кроме Instagram
  const hasControls = platform === 'youtube' || platform === 'tiktok' || isPlaying;

  // Если isPlaying (пользователь нажал Play), то точно автоплей и звук
  const shouldAutoplay = isPlaying || (platform !== 'instagram' && isVisible);
  // Для TikTok - со звуком, для остальных - без звука (если не включен isPlaying)
  const shouldMute = isPlaying ? false : (platform !== 'tiktok');

  return (
    <div className={`video-list-player ${isPlaying ? 'interactive' : ''}`}>
      <div className="video-container">
        {renderPlayer({
          autoplay: shouldAutoplay,
          muted: shouldMute,
          loop: true,
          controls: hasControls,
          showText: false,
        })}
      </div>
    </div>
  );
};

VideoListPlayer.displayName = 'VideoListPlayer';

export default VideoListPlayer;

