import React, { useRef } from 'react';
import YouTubePlayer from './YouTubePlayer';
import TikTokPlayer from './TikTokPlayer';
import InstagramPlayer from './InstagramPlayer';
import VideoOverlay from './VideoOverlay';
import { useVideoPlayer } from './useVideoPlayer';
import './UnifiedVideoPlayer.css';

const UnifiedVideoPlayer = ({ 
  platform, 
  platformVideoId, 
  sourceUrl,
  autoplay = true,
  muted = true,
  loop = false,
}) => {
  const youtubePlayerRef = useRef(null);
  const tiktokPlayerRef = useRef(null);
  const videoPlayer = useVideoPlayer(muted);

  // Обработчик изменения состояния от плеера
  const handleStateChange = (playing, isMuted) => {
    videoPlayer.updatePlayingState(playing);
    videoPlayer.updateMutedState(isMuted);
  };

  // Устанавливаем ref плеера в хук после инициализации
  React.useEffect(() => {
    // Небольшая задержка для инициализации плеера
    const timer = setTimeout(() => {
      if (platform === 'youtube' && youtubePlayerRef.current) {
        videoPlayer.setPlayer(youtubePlayerRef.current);
      } else if (platform === 'tiktok' && tiktokPlayerRef.current) {
        videoPlayer.setPlayer(tiktokPlayerRef.current);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [platform, platformVideoId, videoPlayer]);

  // Определение, какой плеер использовать
  const renderPlayer = () => {
    if (!platform || !platformVideoId) {
      return <div className="video-error">Video not available</div>;
    }

    switch (platform) {
      case 'youtube':
        return (
          <YouTubePlayer
            ref={youtubePlayerRef}
            videoId={platformVideoId}
            autoplay={autoplay}
            muted={muted}
            loop={loop}
            onStateChange={handleStateChange}
          />
        );
      
      case 'tiktok':
        return (
          <TikTokPlayer
            ref={tiktokPlayerRef}
            videoId={platformVideoId}
            autoplay={autoplay}
            muted={muted}
            loop={loop}
            onStateChange={handleStateChange}
          />
        );
      
      case 'instagram':
        return (
          <InstagramPlayer
            postId={platformVideoId}
            sourceUrl={sourceUrl}
          />
        );
      
      default:
        return <div className="video-error">Unsupported platform</div>;
    }
  };

  return (
    <div className="unified-video-player">
      <div className="video-container">
        {renderPlayer()}
      </div>
      <VideoOverlay 
        platform={platform}
        isPlaying={videoPlayer.isPlaying}
        isMuted={videoPlayer.isMuted}
        onPlay={videoPlayer.play}
        onPause={videoPlayer.pause}
        onToggleMute={videoPlayer.toggleMute}
      />
    </div>
  );
};

export default UnifiedVideoPlayer;

