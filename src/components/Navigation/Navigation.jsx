import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';
import EmailVerificationModal from '../Auth/EmailVerificationModal';
import './Navigation.css';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [codeAlreadySent, setCodeAlreadySent] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navigation">
        {isAuthenticated() ? (
          <div className="user-menu-container">
            {/* Collections quick access button */}
            <button
              className="nav-icon-button"
              onClick={() => navigate('/collections')}
              title="My Collections"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="user-menu-overlay"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="user-menu">
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      navigate('/collections');
                      setShowUserMenu(false);
                    }}
                  >
                    My Collections
                  </button>
                  <div className="user-menu-divider" />
                  <button className="user-menu-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button
              className="auth-button login"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
            <button
              className="auth-button register"
              onClick={() => setShowRegisterModal(true)}
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>

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
    </>
  );
};

export default Navigation;

