import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagBadge from '../TagBadge/TagBadge';
import TutorialCard from '../TutorialCard/TutorialCard';
import LikeButton from '../LikeButton/LikeButton';
import SaveToCollectionButton from '../SaveToCollection/SaveToCollectionButton';
import './VideoDetailSidebar.css';

const VideoDetailSidebar = ({ video, onAuthRequired }) => {
  const navigate = useNavigate();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!video) {
    return null;
  }

  const hasFeature = (feature) => {
    return video[feature] === true;
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/?category_ids[]=${categoryId}`);
  };

  const features = [
    { key: 'has_visual_effects', label: 'Visual Effects' },
    { key: 'has_3d', label: '3D' },
    { key: 'has_animations', label: 'Animations' },
    { key: 'has_typography', label: 'Typography' },
    { key: 'has_sound_design', label: 'Sound Design' },
  ];

  return (
    <div className="video-detail-sidebar">
      <div className="sidebar-top-actions">
        {video.categories && video.categories.length > 0 && (
          <div className="categories-container">
            {video.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="category-link"
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="sidebar-header">
        <h2 className="video-title">{video.title}</h2>
        <div className="video-actions-sidebar">
          <LikeButton
            videoId={video.id}
            initialLiked={video.is_liked || false}
            initialLikesCount={video.likes_count || 0}
            onAuthRequired={onAuthRequired}
          />
          <SaveToCollectionButton
            videoId={video.id}
            onAuthRequired={onAuthRequired}
          />
        </div>
      </div>

      {(video.public_summary_html || video.public_summary) && (
        <div className="sidebar-section">
          <h3>Description</h3>
          <div 
            className={`description-container ${!isDescriptionExpanded ? 'collapsed' : ''}`}
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {video.public_summary_html ? (
              <div 
                className="video-summary" 
                dangerouslySetInnerHTML={{ __html: video.public_summary_html }}
              />
            ) : (
              <p className="video-summary">{video.public_summary}</p>
            )}
          </div>
        </div>
      )}


      {video.tags && video.tags.length > 0 && (
        <div className="sidebar-section">
          <h3>Tags</h3>
          <div className="tags-container">
            {video.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {features.filter(feature => hasFeature(feature.key)).length > 0 && (
        <div className="sidebar-section">
          <h3>Features</h3>
          <div className="features-list">
            {features
              .filter(feature => hasFeature(feature.key))
              .map((feature) => (
                <div
                  key={feature.key}
                  className="feature-item active"
                >
                  <span className="feature-icon">✓</span>
                  <span className="feature-label">{feature.label}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {video.tutorials && video.tutorials.length > 0 && (
        <div className="sidebar-section">
          <h3>Tutorials</h3>
          <div className="tutorials-container">
            {video.tutorials.map((tutorial, index) => (
              <TutorialCard key={index} tutorial={tutorial} />
            ))}
          </div>
        </div>
      )}

      {video.details_public && Object.keys(video.details_public).length > 0 && (
        <div className="sidebar-section">
          <h3>Additional Details</h3>
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

