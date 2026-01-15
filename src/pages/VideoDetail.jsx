import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VideoDetailView from '../components/VideoDetailView/VideoDetailView';
import VideoDetailSidebar from '../components/VideoDetailSidebar/VideoDetailSidebar';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import EmailVerificationModal from '../components/Auth/EmailVerificationModal';
import { getVideoReference, searchVideoReferences } from '../services/api';
import './VideoDetail.css';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [codeAlreadySent, setCodeAlreadySent] = useState(false);

  // Получаем информацию о списке видео из location.state
  const [videoListState, setVideoListState] = useState(location.state || null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(
    location.state?.currentIndex ?? -1
  );

  const { data: videoData, isLoading } = useQuery({
    queryKey: ['videoReference', id],
    queryFn: async () => {
      const response = await getVideoReference(id);
      return response.data;
    },
    enabled: !!id,
  });

  const video = videoData?.data;

  // Обновляем состояние при изменении id из URL
  useEffect(() => {
    if (location.state) {
      setVideoListState(location.state.videoList);
      setCurrentVideoIndex(location.state.currentIndex);
    } else if (!videoListState && video) {
      // Пытаемся восстановить список видео с теми же параметрами
      const loadVideoList = async () => {
        try {
          const response = await searchVideoReferences('', {});
          const videos = response.data.data || [];
          const currentIndex = videos.findIndex(v => v.id === parseInt(id));
          if (currentIndex !== -1) {
            setVideoListState({
              videos,
              queryParams: {},
              pagination: response.data.meta || {}
            });
            setCurrentVideoIndex(currentIndex);
          }
        } catch (error) {
          console.error('Error loading video list:', error);
        }
      };
      loadVideoList();
    }
  }, [id, location.state]);

  const handleAuthRequired = () => {
    setShowRegisterModal(true);
  };

  const handleLoginSuccess = (data) => {
    if (data?.showVerification) {
      setVerificationEmail(data.email);
      setShowVerificationModal(true);
    }
  };

  const handleRegisterSuccess = (data) => {
    if (data?.showVerification) {
      setVerificationEmail(data.email);
      setShowVerificationModal(true);
      // Код уже отправлен при регистрации, передаем это в модалку
      setCodeAlreadySent(true);
    }
  };

  const handleVerificationSuccess = (data) => {
    if (data?.showLogin) {
      setVerificationEmail(data.email);
      setShowLoginModal(true);
    }
  };

  // Функция для навигации к следующему/предыдущему видео
  const navigateToVideo = async (direction) => {
    if (!videoListState) return;

    const { videos, queryParams, pagination } = videoListState;
    let newIndex = currentVideoIndex;

    if (direction === 'next') {
      newIndex = currentVideoIndex + 1;
      // Если достигли конца текущей страницы, загружаем следующую
      if (newIndex >= videos.length && pagination && pagination.current_page < pagination.last_page) {
        try {
          const nextPage = pagination.current_page + 1;
          const response = await searchVideoReferences(
            queryParams.search || '',
            { ...queryParams, page: nextPage, per_page: pagination.per_page || 20 }
          );
          const newVideos = response.data.data || [];
          const newPagination = response.data.meta || {};
          
          if (newVideos.length > 0) {
            const updatedVideoList = {
              videos: [...videos, ...newVideos],
              queryParams,
              pagination: newPagination
            };
            setVideoListState(updatedVideoList);
            setCurrentVideoIndex(videos.length);
            navigate(`/video/${newVideos[0].id}`, {
              state: {
                videoList: updatedVideoList,
                currentIndex: videos.length
              },
              replace: false
            });
          }
        } catch (error) {
          console.error('Error loading next page:', error);
        }
        return;
      }
    } else if (direction === 'prev') {
      newIndex = currentVideoIndex - 1;
    }

    // Проверяем границы
    if (newIndex < 0 || newIndex >= videos.length) {
      return; // Блокируем навигацию на краях
    }

    const nextVideo = videos[newIndex];
    if (nextVideo) {
      navigate(`/video/${nextVideo.id}`, {
        state: {
          videoList: videoListState,
          currentIndex: newIndex
        },
        replace: false
      });
    }
  };

  if (isLoading) {
    return (
      <div className="video-detail-page loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-detail-page error">
        <div className="error-message">Video not found</div>
        <button onClick={() => navigate('/')} className="back-button">
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      <div className="video-detail-container">
        <div className="video-detail-main">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          {video.source_url && (
            <a
              href={video.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="open-button"
            >
              Open →
            </a>
          )}
          <VideoDetailView 
            video={video} 
            onSwipe={videoListState ? navigateToVideo : undefined}
            canSwipeNext={videoListState ? (currentVideoIndex < (videoListState.videos?.length || 0) - 1 || (videoListState.pagination?.current_page || 0) < (videoListState.pagination?.last_page || 0)) : false}
            canSwipePrev={videoListState ? currentVideoIndex > 0 : false}
          />
        </div>
        <div className="video-detail-sidebar-wrapper">
          <VideoDetailSidebar video={video} onAuthRequired={handleAuthRequired} />
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onSuccess={handleLoginSuccess}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
        onSuccess={handleRegisterSuccess}
      />

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setCodeAlreadySent(false);
        }}
        email={verificationEmail}
        codeAlreadySent={codeAlreadySent}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default VideoDetail;

