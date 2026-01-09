import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const YouTubePlayer = forwardRef(({ videoId, autoplay, muted, loop, onStateChange }, ref) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  // Загрузить YouTube IFrame Player API
  useEffect(() => {
    let isMounted = true;

    function initializePlayer() {
      if (!containerRef.current || !videoId) return;

      const params = {
        videoId: videoId,
        playerVars: {
          controls: 0,
          autoplay: autoplay ? 1 : 0,
          mute: muted ? 1 : 0,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          loop: loop ? 1 : 0,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            playerRef.current = event.target;
            if (autoplay) {
              event.target.playVideo();
            }
            if (onStateChange) {
              onStateChange(autoplay, muted);
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2, YT.PlayerState.ENDED = 0
            const playing = event.data === 1;
            // Получаем текущее состояние звука
            let currentMuted = muted;
            try {
              if (event.target && event.target.isMuted) {
                currentMuted = event.target.isMuted();
              }
            } catch (e) {
              // Игнорируем ошибку
            }
            if (onStateChange) {
              onStateChange(playing, currentMuted);
            }
          },
        },
      };

      if (loop) {
        params.playerVars.playlist = videoId;
      }

      try {
        playerRef.current = new window.YT.Player(containerRef.current, params);
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    }

    if (!window.YT) {
      // Сохраняем существующий обработчик, если есть
      const existingHandler = window.onYouTubeIframeAPIReady;
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (existingHandler) {
          existingHandler();
        }
        if (isMounted && containerRef.current && videoId) {
          initializePlayer();
        }
      };
    } else if (window.YT && window.YT.Player) {
      // API уже загружен
      if (containerRef.current && videoId) {
        initializePlayer();
      }
    }

    return () => {
      isMounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, autoplay, muted, loop, onStateChange]);

  // Предоставляем методы управления через ref
  useImperativeHandle(ref, () => ({
    play: () => {
      if (playerRef.current && playerRef.current.playVideo) {
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    },
    mute: () => {
      if (playerRef.current && playerRef.current.mute) {
        playerRef.current.mute();
      }
    },
    unmute: () => {
      if (playerRef.current && playerRef.current.unMute) {
        playerRef.current.unMute();
      }
    },
  }));

  return <div ref={containerRef} className="youtube-player" />;
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;

