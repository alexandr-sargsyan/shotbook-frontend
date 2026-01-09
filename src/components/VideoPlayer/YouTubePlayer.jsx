import React, { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, autoplay, muted, loop }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Параметры для YouTube iframe
    const params = new URLSearchParams({
      controls: '0',
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      rel: '0',
      playsinline: '1',
      enablejsapi: '1',
    });

    // Для loop нужен playlist параметр
    if (loop) {
      params.append('loop', '1');
      params.append('playlist', videoId);
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

    // Создать iframe
    if (containerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
    }
  }, [videoId, autoplay, muted, loop]);

  return <div ref={containerRef} className="youtube-player" />;
};

export default YouTubePlayer;

