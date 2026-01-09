import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const TikTokPlayer = forwardRef(({ videoId, autoplay, muted, loop, onStateChange }, ref) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Параметры для TikTok iframe
    const params = new URLSearchParams({
      controls: '0',
      autoplay: autoplay ? '1' : '0',
      muted: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      rel: '0',
    });

    // TikTok embed URL - используем стандартный формат
    const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;

    // Создать iframe
    if (containerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allow = 'autoplay; fullscreen; encrypted-media';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.id = `tiktok-player-${videoId}`;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
      iframeRef.current = iframe;

      // Слушаем сообщения от TikTok плеера
      const handleMessage = (event) => {
        if (!isMounted) return;
        
        // TikTok может отправлять события через postMessage
        // Также проверяем события от iframe
        if (event.source === iframe.contentWindow) {
          if (event.data && typeof event.data === 'object') {
            if (event.data.type === 'play' || event.data.event === 'play') {
              if (onStateChange) onStateChange(true, muted);
            } else if (event.data.type === 'pause' || event.data.event === 'pause') {
              if (onStateChange) onStateChange(false, muted);
            }
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Инициализируем состояние после загрузки iframe
      iframe.onload = () => {
        if (isMounted && autoplay && onStateChange) {
          setTimeout(() => {
            if (isMounted) {
              onStateChange(true, muted);
            }
          }, 500);
        }
      };

      return () => {
        isMounted = false;
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [videoId, autoplay, muted, loop, onStateChange]);

  // Состояние для отслеживания воспроизведения
  const [currentPlaying, setCurrentPlaying] = React.useState(autoplay);

  // Предоставляем методы управления через ref
  useImperativeHandle(ref, () => ({
    play: () => {
      // Для TikTok используем клик по центру iframe
      // Это должно запустить/возобновить видео
      if (iframeRef.current) {
        try {
          const rect = iframeRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Создаем событие клика
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: centerX,
            clientY: centerY,
          });
          
          // Пытаемся отправить клик в iframe
          // Из-за CORS это может не работать, но попробуем
          iframeRef.current.dispatchEvent(clickEvent);
          
          // Обновляем состояние
          setCurrentPlaying(true);
          if (onStateChange) {
            onStateChange(true, muted);
          }
        } catch (error) {
          console.warn('TikTok play command failed:', error);
          // В случае ошибки просто обновляем состояние
          setCurrentPlaying(true);
          if (onStateChange) {
            onStateChange(true, muted);
          }
        }
      }
    },
    pause: () => {
      // Для TikTok пауза работает через клик по видео
      if (iframeRef.current) {
        try {
          const rect = iframeRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Создаем событие клика для паузы
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: centerX,
            clientY: centerY,
          });
          
          iframeRef.current.dispatchEvent(clickEvent);
          
          // Обновляем состояние
          setCurrentPlaying(false);
          if (onStateChange) {
            onStateChange(false, muted);
          }
        } catch (error) {
          console.warn('TikTok pause command failed:', error);
          // В случае ошибки просто обновляем состояние
          setCurrentPlaying(false);
          if (onStateChange) {
            onStateChange(false, muted);
          }
        }
      }
    },
    mute: () => {
      // Для TikTok звук сложно управлять программно из-за CORS
      // Важно: НЕ вызываем play/pause, только обновляем состояние звука
      // Сохраняем текущее состояние воспроизведения
      if (onStateChange) {
        // Передаем текущее состояние воспроизведения и новое состояние звука (muted = true)
        onStateChange(currentPlaying, true);
      }
    },
    unmute: () => {
      // Для TikTok звук сложно управлять программно из-за CORS
      // Важно: НЕ вызываем play/pause, только обновляем состояние звука
      // Сохраняем текущее состояние воспроизведения
      if (onStateChange) {
        // Передаем текущее состояние воспроизведения и новое состояние звука (muted = false)
        onStateChange(currentPlaying, false);
      }
    },
  }), [muted, currentPlaying, onStateChange]);

  return <div ref={containerRef} className="tiktok-player" />;
});

TikTokPlayer.displayName = 'TikTokPlayer';

export default TikTokPlayer;

