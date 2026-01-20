import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logo.css';

const Logo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className="logo-container" onClick={handleClick} title="Go to home">
      <div className="logo-icon">
        <span className="logo-letter">S</span>
      </div>
      <span className="logo-text">ShotBook</span>
    </div>
  );
};

export default Logo;

