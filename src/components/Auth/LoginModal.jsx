import React, { useState } from 'react';
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
        setError(result.error || 'Ошибка входа');
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
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <div className="auth-modal-header">
            <h2>Email не подтвержден</h2>
            <button className="auth-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="auth-modal-body">
            <p>Для входа необходимо подтвердить email адрес.</p>
            <p>Пожалуйста, проверьте почту и введите код подтверждения.</p>
            <button
              className="auth-button primary"
              onClick={() => {
                setRequiresVerification(false);
                onSuccess?.({ showVerification: true, email: userEmail });
                onClose();
              }}
            >
              Ввести код подтверждения
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Вход</h2>
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
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Введите пароль"
            />
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <div className="auth-modal-footer">
            <p>
              Нет аккаунта?{' '}
              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister?.();
                }}
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

