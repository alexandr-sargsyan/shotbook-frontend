import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoListPlayer from '../VideoPlayer/VideoListPlayer';
import LikeButton from '../LikeButton/LikeButton';
import SaveToCollectionButton from '../SaveToCollection/SaveToCollectionButton';
import './VideoCard.css';

const VideoCard = ({ video, onAuthRequired }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const cardRef = useRef(null);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return '▶️';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      case 'facebook':
        return '📘';
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

  // Lazy loading через Intersection Observer
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Небольшая задержка перед загрузкой видео для оптимизации
            setTimeout(() => {
              setShouldLoad(true);
            }, 200);
          } else {
            setIsVisible(false);
            // Останавливаем загрузку при уходе из viewport
            setShouldLoad(false);
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до появления в viewport
        threshold: 0.1,
      }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Определяем, что показывать
  const hasVideo = video.platform && video.platform_video_id;

  return (
    <div className="video-card" onClick={handleClick} ref={cardRef}>
      {/* Верхний блок - только тайтл */}
      <div className="video-title-top">
        <h3 className="video-title">{video.title}</h3>
      </div>

      {/* Видео-превью */}
      <div className="video-preview">
        {hasVideo && shouldLoad ? (
          <div className="video-player-wrapper">
            <VideoListPlayer
              platform={video.platform}
              platformVideoId={video.platform_video_id}
              sourceUrl={video.source_url}
              isVisible={isVisible}
            />
          </div>
        ) : (
          <div className="video-placeholder">
            <span className="video-icon">{getPlatformIcon(video.platform)}</span>
          </div>
        )}
        {video.duration_sec && (
          <div className="video-duration">{formatDuration(video.duration_sec)}</div>
        )}
      </div>

      {/* Нижний блок - лайк слева, кнопка Details в центре, Save справа */}
      <div className="video-info-bottom">
        <div className="video-actions-left" onClick={(e) => e.stopPropagation()}>
          <LikeButton
            videoId={video.id}
            initialLiked={video.is_liked || false}
            initialLikesCount={video.likes_count || 0}
            onAuthRequired={onAuthRequired}
          />
        </div>
        <button 
          className="details-button"
        >
          Details
        </button>
        <div className="video-actions-right" onClick={(e) => e.stopPropagation()}>
          <SaveToCollectionButton
            videoId={video.id}
            onAuthRequired={onAuthRequired}
            showText={false}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

