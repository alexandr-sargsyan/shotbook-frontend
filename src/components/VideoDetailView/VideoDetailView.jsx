import React from 'react';
import VideoDetailPlayer from '../VideoPlayer/VideoDetailPlayer';
import './VideoDetailView.css';

const VideoDetailView = ({ video }) => {
  if (!video) {
    return <div className="video-detail-loading">Loading...</div>;
  }

  return (
    <div className="video-detail-view">
      <div className="video-player-container">
        {video.platform && video.platform_video_id ? (
          <VideoDetailPlayer
            platform={video.platform}
            platformVideoId={video.platform_video_id}
            sourceUrl={video.source_url}
          />
        ) : (
          <div className="video-placeholder-large">
            <span className="video-icon-large">🎬</span>
            <p>Video not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetailView;

