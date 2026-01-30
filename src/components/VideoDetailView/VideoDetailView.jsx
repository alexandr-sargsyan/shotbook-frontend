import React, { useState, useRef, useEffect } from 'react';
import VideoDetailPlayer from '../VideoPlayer/VideoDetailPlayer';
import LikeButton from '../LikeButton/LikeButton';
import SaveToCollectionButton from '../SaveToCollection/SaveToCollectionButton';
import './VideoDetailView.css';

const VideoDetailView = ({ video, onSwipe, canSwipeNext, canSwipePrev, onAuthRequired }) => {
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [mouseStart, setMouseStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const wheelAccumulatorRef = useRef(0);
  const [isWheelLocked, setIsWheelLocked] = useState(false);
  const [isSwipeLocked, setIsSwipeLocked] = useState(false);

  // Минимальное расстояние для срабатывания свайпа (в пикселях)
  const minSwipeDistance = 50;
  // Минимальное расстояние для срабатывания свайпа тачпадом (в пикселях)
  const minWheelDistance = 100;

  // Блокируем прокрутку страницы во время свайпа
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDragging]);

  // Глобальные обработчики для mouseMove и mouseUp
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
    };

    const handleMouseUp = (e) => {
      if (!mouseStart || isSwipeLocked) {
        setIsDragging(false);
        setMouseStart(null);
        return;
      }

      const distance = mouseStart - e.clientY;
      const isUpSwipe = distance > minSwipeDistance;
      const isDownSwipe = distance < -minSwipeDistance;

      if (isUpSwipe && canSwipeNext && onSwipe) {
        setIsSwipeLocked(true);
        setIsDragging(false);
        setMouseStart(null);
        onSwipe('next');
        setTimeout(() => setIsSwipeLocked(false), 500);
        return;
      }
      if (isDownSwipe && canSwipePrev && onSwipe) {
        setIsSwipeLocked(true);
        setIsDragging(false);
        setMouseStart(null);
        onSwipe('prev');
        setTimeout(() => setIsSwipeLocked(false), 500);
        return;
      }

      setIsDragging(false);
      setMouseStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, mouseStart, canSwipeNext, canSwipePrev, onSwipe, minSwipeDistance, isSwipeLocked]);

  // Сброс аккумулятора при изменении видео
  useEffect(() => {
    wheelAccumulatorRef.current = 0;
  }, [video?.id]);

  if (!video) {
    return <div className="video-detail-loading">Loading...</div>;
  }

  // Обработка touch событий
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isSwipeLocked) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && canSwipeNext && onSwipe) {
      setIsSwipeLocked(true);
      setTouchStart(null);
      setTouchEnd(null);
      onSwipe('next');
      setTimeout(() => setIsSwipeLocked(false), 500);
      return;
    }
    if (isDownSwipe && canSwipePrev && onSwipe) {
      setIsSwipeLocked(true);
      setTouchStart(null);
      setTouchEnd(null);
      onSwipe('prev');
      setTimeout(() => setIsSwipeLocked(false), 500);
      return;
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Обработка mouse событий для десктопа
  const onMouseDown = (e) => {
    setIsDragging(true);
    setMouseStart(e.clientY);
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!isDragging || !mouseStart) return;
    e.preventDefault();
  };

  const onMouseUp = (e) => {
    if (!isDragging || !mouseStart || isSwipeLocked) {
      setIsDragging(false);
      setMouseStart(null);
      return;
    }

    const distance = mouseStart - e.clientY;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && canSwipeNext && onSwipe) {
      setIsSwipeLocked(true);
      setIsDragging(false);
      setMouseStart(null);
      onSwipe('next');
      setTimeout(() => setIsSwipeLocked(false), 500);
      return;
    }
    if (isDownSwipe && canSwipePrev && onSwipe) {
      setIsSwipeLocked(true);
      setIsDragging(false);
      setMouseStart(null);
      onSwipe('prev');
      setTimeout(() => setIsSwipeLocked(false), 500);
      return;
    }

    setIsDragging(false);
    setMouseStart(null);
  };

  const onMouseLeave = (e) => {
    // Обработка выхода мыши за пределы элемента
    // Глобальные обработчики в useEffect обработают это
  };

  // Обработка wheel событий для тачпада
  const onWheel = (e) => {
    // Блокируем, если уже происходит переключение
    if (isWheelLocked) {
      e.preventDefault();
      return;
    }

    // Игнорируем горизонтальную прокрутку
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }

    // Накапливаем вертикальную прокрутку в ref (без ререндера)
    wheelAccumulatorRef.current += e.deltaY;

    // Проверяем, достигли ли минимального расстояния
    if (Math.abs(wheelAccumulatorRef.current) >= minWheelDistance) {
      // Блокируем сразу перед переключением
      setIsWheelLocked(true);
      const accumulator = wheelAccumulatorRef.current;
      wheelAccumulatorRef.current = 0;

      if (accumulator < 0 && canSwipeNext && onSwipe) {
        // Прокрутка вверх (отрицательное deltaY) → следующее видео
        onSwipe('next');
      } else if (accumulator > 0 && canSwipePrev && onSwipe) {
        // Прокрутка вниз (положительное deltaY) → предыдущее видео
        onSwipe('prev');
      }

      // Разблокируем через 500ms (увеличено для предотвращения множественных переключений)
      setTimeout(() => {
        setIsWheelLocked(false);
        wheelAccumulatorRef.current = 0;
      }, 500);
    }

    // Предотвращаем стандартную прокрутку страницы
    e.preventDefault();
  };


  return (
    <div
      className="video-detail-view"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
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

      <div className="video-meta-actions">
        <div className="video-meta-left">
          <LikeButton
            videoId={video.id}
            initialLiked={video.is_liked || false}
            initialLikesCount={video.likes_count || 0}
            onAuthRequired={onAuthRequired}
          />
        </div>
        <div className="video-meta-right">
          <SaveToCollectionButton
            videoId={video.id}
            onAuthRequired={onAuthRequired}
          />
        </div>
      </div>

      {/* Кнопки-стрелки для десктопа */}
      <div className="video-navigation-arrows">
        <button
          className={`nav-arrow nav-arrow-up ${!canSwipeNext ? 'disabled' : ''}`}
          onClick={() => canSwipeNext && onSwipe && onSwipe('next')}
          disabled={!canSwipeNext}
          aria-label="Next video"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button
          className={`nav-arrow nav-arrow-down ${!canSwipePrev ? 'disabled' : ''}`}
          onClick={() => canSwipePrev && onSwipe && onSwipe('prev')}
          disabled={!canSwipePrev}
          aria-label="Previous video"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoDetailView;

