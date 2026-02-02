import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      if (result.requiresVerification) {
        setRequiresVerification(true);
        setUserEmail(formData.email);
      } else {
        setError(result.error || 'Sign in error');
      }
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  if (requiresVerification) {
    return createPortal(
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <div className="auth-modal-header">
            <h2>Email Not Verified</h2>
            <button className="auth-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="auth-modal-body">
            <p>You need to verify your email address to sign in.</p>
            <p>Please check your email and enter the verification code.</p>
            <button
              className="auth-button primary"
              onClick={() => {
                setRequiresVerification(false);
                onSuccess?.({ showVerification: true, email: userEmail });
                onClose();
              }}
            >
              Enter Verification Code
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Sign In</h2>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>
        <form className="auth-modal-body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-modal-footer">
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister?.();
                }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;
