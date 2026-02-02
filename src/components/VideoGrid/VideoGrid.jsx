import React, { useEffect, useRef } from 'react';
import VideoCard from '../VideoCard/VideoCard';
import './VideoGrid.css';

const VideoGrid = ({ 
  videos = [], 
  loading = false, 
  onAuthRequired, 
  queryParams = {}, 
  pagination = {},
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const observerTarget = useRef(null);

  // Intersection Observer для infinite scroll
  useEffect(() => {
    if (!fetchNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (loading && videos.length === 0) {
    return (
      <div className="video-grid loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-grid empty">
        <div className="empty-message">No videos found</div>
      </div>
    );
  }

  return (
    <>
      <div className="video-grid">
        {videos.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onAuthRequired={onAuthRequired}
            videoList={{ videos, queryParams, pagination }}
            currentIndex={index}
          />
        ))}
      </div>
      {/* Элемент-триггер для загрузки следующей страницы */}
      {hasNextPage && (
        <div ref={observerTarget} className="infinite-scroll-trigger">
          {isFetchingNextPage && (
            <div className="loading-spinner">Loading more videos...</div>
          )}
        </div>
      )}
    </>
  );
};

export default VideoGrid;

