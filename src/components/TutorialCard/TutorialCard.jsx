import React from 'react';
import './TutorialCard.css';

const TutorialCard = ({ tutorial }) => {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRange = () => {
    if (tutorial.start_sec !== null && tutorial.end_sec !== null) {
      return `${formatTime(tutorial.start_sec)} - ${formatTime(tutorial.end_sec)}`;
    }
    return '';
  };

  return (
    <div className="tutorial-card">
      {tutorial.label && (
        <div className="tutorial-label">{tutorial.label}</div>
      )}
      {tutorial.start_sec !== null && tutorial.end_sec !== null && (
        <div className="tutorial-time">{formatTimeRange()}</div>
      )}
      {tutorial.tutorial_url && (
        <a 
          href={tutorial.tutorial_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="tutorial-link"
        >
          Открыть урок →
        </a>
      )}
    </div>
  );
};

export default TutorialCard;

