import { useState, useCallback, useRef, useEffect } from 'react';

export const useVideoPlayer = (initialMuted = true) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const playerRef = useRef(null);

  // Синхронизируем isMuted с initialMuted при изменении
  useEffect(() => {
    setIsMuted(initialMuted);
  }, [initialMuted]);

  const setPlayer = useCallback((player) => {
    playerRef.current = player;
  }, []);

  const play = useCallback(() => {
    if (playerRef.current) {
      try {
        // Не обновляем состояние здесь - оно обновится через onStateChange от плеера
        if (playerRef.current.play) {
          playerRef.current.play();
        } else if (playerRef.current.playVideo) {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.warn('Play command failed:', error);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      try {
        // Не обновляем состояние здесь - оно обновится через onStateChange от плеера
        if (playerRef.current.pause) {
          playerRef.current.pause();
        } else if (playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.warn('Pause command failed:', error);
      }
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const mute = useCallback(() => {
    if (playerRef.current) {
      try {
        if (playerRef.current.mute) {
          playerRef.current.mute();
        }
        // Состояние обновится через onStateChange от плеера
      } catch (error) {
        console.warn('Mute command failed:', error);
      }
    }
  }, []);

  const unmute = useCallback(() => {
    if (playerRef.current) {
      try {
        if (playerRef.current.unmute) {
          playerRef.current.unmute();
        } else if (playerRef.current.unMute) {
          playerRef.current.unMute();
        }
        // Состояние обновится через onStateChange от плеера
      } catch (error) {
        console.warn('Unmute command failed:', error);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);

  const updatePlayingState = useCallback((playing) => {
    setIsPlaying(playing);
  }, []);

  const updateMutedState = useCallback((muted) => {
    setIsMuted(muted);
  }, []);

  return {
    isPlaying,
    isMuted,
    setPlayer,
    play,
    pause,
    togglePlayPause,
    mute,
    unmute,
    toggleMute,
    updatePlayingState,
    updateMutedState,
  };
};

