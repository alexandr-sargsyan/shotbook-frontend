import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      // После регистрации открываем модальное окно подтверждения
      onSuccess?.({ showVerification: true, email: formData.email });
      onClose();
    } else {
      setError(result.error || 'Ошибка регистрации');
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

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Регистрация</h2>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>
        <form className="auth-modal-body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-form-group">
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ваше имя"
            />
          </div>

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
              minLength={8}
              placeholder="Минимум 8 символов"
            />
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="auth-modal-footer">
            <p>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin?.();
                }}
              >
                Войти
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;

