import React from 'react';
import YouTubePlayer from './YouTubePlayer';
import TikTokPlayer from './TikTokPlayer';
import InstagramPlayer from './InstagramPlayer';
import './UnifiedVideoPlayer.css';

const UnifiedVideoPlayer = ({ 
  platform, 
  platformVideoId, 
  sourceUrl,
  autoplay = true,
  muted = true,
  loop = false,
}) => {
  // Определение, какой плеер использовать
  const renderPlayer = () => {
    if (!platform || !platformVideoId) {
      return <div className="video-error">Video not available</div>;
    }

    switch (platform) {
      case 'youtube':
        return (
          <YouTubePlayer
            videoId={platformVideoId}
            autoplay={autoplay}
            muted={muted}
            loop={loop}
          />
        );
      
      case 'tiktok':
        return (
          <TikTokPlayer
            videoId={platformVideoId}
            autoplay={autoplay}
            muted={muted}
            loop={loop}
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
    </div>
  );
};

UnifiedVideoPlayer.displayName = 'UnifiedVideoPlayer';

export default UnifiedVideoPlayer;

