import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSharedCollection } from '../services/api';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import EmailVerificationModal from '../components/Auth/EmailVerificationModal';
import { useAuth } from '../contexts/AuthContext';
import './SharedCollectionView.css';

const SharedCollectionView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [codeAlreadySent, setCodeAlreadySent] = useState(false);

  const { data: collectionData, isLoading, error } = useQuery({
    queryKey: ['sharedCollection', token],
    queryFn: async () => {
      const response = await getSharedCollection(token);
      return response.data;
    },
    enabled: !!token,
  });

  const handleAuthRequired = () => {
    if (!isAuthenticated()) {
      setShowRegisterModal(true);
    }
  };

  const handleRegisterSuccess = (email) => {
    setShowRegisterModal(false);
    setVerificationEmail(email);
    setCodeAlreadySent(true);
    setShowVerificationModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setCodeAlreadySent(false);
  };

  if (isLoading) {
    return (
      <div className="shared-collection-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !collectionData) {
    return (
      <div className="shared-collection-page">
        <div className="error">Collection not found</div>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>
    );
  }

  const collection = collectionData.data;
  const videos = collection.videos || [];

  return (
    <div className="shared-collection-page">
      <div className="shared-collection-container">
        <div className="shared-collection-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="collection-info">
            <h1>{collection.name}</h1>
            <p className="collection-count">{videos.length} videos</p>
          </div>
        </div>

        <div className="shared-collection-videos">
          {videos.length === 0 ? (
            <div className="empty-videos">
              <p>This collection is empty</p>
            </div>
          ) : (
            <VideoGrid 
              videos={videos} 
              loading={false}
              onAuthRequired={handleAuthRequired}
            />
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          onClose={() => {
            setShowVerificationModal(false);
            setCodeAlreadySent(false);
          }}
          onVerificationSuccess={handleVerificationSuccess}
          codeAlreadySent={codeAlreadySent}
        />
      )}
    </div>
  );
};

export default SharedCollectionView;
