import React, { useEffect, useRef } from 'react';

const TikTokPlayer = ({ videoId, autoplay, muted, loop }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Параметры для TikTok iframe
    const params = new URLSearchParams({
      controls: '0',
      autoplay: autoplay ? '1' : '0',
      muted: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      rel: '0',
    });

    const embedUrl = `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;

    // Создать iframe
    if (containerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
    }
  }, [videoId, autoplay, muted, loop]);

  return <div ref={containerRef} className="tiktok-player" />;
};

export default TikTokPlayer;

