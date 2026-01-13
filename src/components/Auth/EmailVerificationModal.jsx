import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

const EmailVerificationModal = ({ isOpen, onClose, email: initialEmail, codeAlreadySent = false, onSuccess }) => {
  const { verifyCode, sendVerificationCode, login } = useAuth();
  const [email, setEmail] = useState(initialEmail || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(codeAlreadySent);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      setError('Введите email');
      return;
    }

    setSendingCode(true);
    setError('');

    const result = await sendVerificationCode(email);

    if (result.success) {
      setCodeSent(true);
      setCountdown(60); // 60 секунд до возможности повторной отправки
    } else {
      setError(result.error || 'Ошибка отправки кода');
    }

    setSendingCode(false);
  };

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      if (codeAlreadySent) {
        // Код уже отправлен при регистрации, сразу показываем форму ввода
        setCodeSent(true);
      } else {
        // Код не отправлен, нужно отправить
        handleSendCode();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail, codeAlreadySent]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyCode(email, code);

    if (result.success) {
      // После подтверждения нужно войти вручную
      setError('Email подтвержден. Пожалуйста, войдите.');
      setTimeout(() => {
        onClose();
        onSuccess?.({ showLogin: true, email });
      }, 2000);
    } else {
      setError(result.error || 'Неверный код');
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Подтверждение email</h2>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>
        <form className="auth-modal-body" onSubmit={handleVerify}>
          {error && (
            <div className={`auth-message ${error.includes('подтвержден') ? 'success' : 'error'}`}>
              {error}
            </div>
          )}

          {!codeSent ? (
            <>
              <div className="auth-form-group">
                <label htmlFor="verification-email">Email</label>
                <input
                  type="email"
                  id="verification-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="button"
                className="auth-button primary"
                onClick={handleSendCode}
                disabled={sendingCode || !email}
              >
                {sendingCode ? 'Отправка...' : 'Отправить код'}
              </button>
            </>
          ) : (
            <>
              <p className="auth-info">
                {codeAlreadySent 
                  ? <>Код подтверждения отправлен на <strong>{email}</strong></>
                  : <>Код подтверждения отправлен на <strong>{email}</strong></>
                }
              </p>
              <p className="auth-info-small">
                Введите 6-значный код из письма. Код действителен 15 минут.
              </p>

              <div className="auth-form-group">
                <label htmlFor="verification-code">Код подтверждения</label>
                <input
                  type="text"
                  id="verification-code"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                    setError('');
                  }}
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="verification-code-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '8px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <button
                type="submit"
                className="auth-button primary"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>

              <div className="auth-modal-footer">
                <p>
                  Не получили код?{' '}
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || sendingCode}
                  >
                    {countdown > 0 ? `Отправить повторно (${countdown}с)` : 'Отправить повторно'}
                  </button>
                </p>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationModal;

