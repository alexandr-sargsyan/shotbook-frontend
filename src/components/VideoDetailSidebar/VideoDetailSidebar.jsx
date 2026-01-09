import React from 'react';
import TagBadge from '../TagBadge/TagBadge';
import TutorialCard from '../TutorialCard/TutorialCard';
import './VideoDetailSidebar.css';

const VideoDetailSidebar = ({ video }) => {
  if (!video) {
    return null;
  }

  const hasFeature = (feature) => {
    return video[feature] === true;
  };

  const features = [
    { key: 'has_visual_effects', label: 'Визуальные эффекты' },
    { key: 'has_3d', label: '3D' },
    { key: 'has_animations', label: 'Анимации' },
    { key: 'has_typography', label: 'Типографика' },
    { key: 'has_sound_design', label: 'Звуковой дизайн' },
  ];

  return (
    <div className="video-detail-sidebar">
      <div className="sidebar-header">
        <h2 className="video-title">{video.title}</h2>
        {video.category && (
          <span className="video-category-badge">{video.category.name}</span>
        )}
      </div>

      {video.public_summary && (
        <div className="sidebar-section">
          <h3>Описание</h3>
          <p className="video-summary">{video.public_summary}</p>
        </div>
      )}

      <div className="sidebar-section">
        <a
          href={video.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="source-link"
        >
          Открыть оригинал →
        </a>
      </div>

      {video.tags && video.tags.length > 0 && (
        <div className="sidebar-section">
          <h3>Теги</h3>
          <div className="tags-container">
            {video.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {video.tutorials && video.tutorials.length > 0 && (
        <div className="sidebar-section">
          <h3>Уроки</h3>
          <div className="tutorials-container">
            {video.tutorials.map((tutorial, index) => (
              <TutorialCard key={index} tutorial={tutorial} />
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <h3>Характеристики</h3>
        <div className="features-list">
          {features.map((feature) => (
            <div
              key={feature.key}
              className={`feature-item ${hasFeature(feature.key) ? 'active' : ''}`}
            >
              <span className="feature-icon">
                {hasFeature(feature.key) ? '✓' : '○'}
              </span>
              <span className="feature-label">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {video.details_public && Object.keys(video.details_public).length > 0 && (
        <div className="sidebar-section">
          <h3>Дополнительно</h3>
          <div className="details-list">
            {Object.entries(video.details_public).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-key">{key}:</span>
                <span className="detail-value">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetailSidebar;

