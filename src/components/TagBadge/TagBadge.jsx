import React from 'react';
import './TagBadge.css';

const TagBadge = ({ tag }) => {
  return (
    <span className="tag-badge">
      {tag.name}
    </span>
  );
};

export default TagBadge;

