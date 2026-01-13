import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VideoDetailView from '../components/VideoDetailView/VideoDetailView';
import VideoDetailSidebar from '../components/VideoDetailSidebar/VideoDetailSidebar';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import EmailVerificationModal from '../components/Auth/EmailVerificationModal';
import { getVideoReference } from '../services/api';
import './VideoDetail.css';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [codeAlreadySent, setCodeAlreadySent] = useState(false);

  const { data: videoData, isLoading } = useQuery({
    queryKey: ['videoReference', id],
    queryFn: async () => {
      const response = await getVideoReference(id);
      return response.data;
    },
    enabled: !!id,
  });

  const video = videoData?.data;

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
          <VideoDetailView video={video} />
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

