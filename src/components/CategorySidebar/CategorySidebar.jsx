import React, { useState } from 'react';
import './CategorySidebar.css';

const CategorySidebar = ({ categories = [], onCategorySelect, selectedCategoryId, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  // Ensure categories is always an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = categoriesArray.some((cat) => cat.parent_id === category.id);
    const isExpanded = expandedCategories[category.id];
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className="category-item">
        <div
          className={`category-row ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <button
              className="category-toggle"
              onClick={() => toggleCategory(category.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="category-spacer" />}
          <button
            className="category-name"
            onClick={() => {
              if (onCategorySelect) {
                onCategorySelect(category.id);
              }
            }}
          >
            {category.name}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="category-children">
            {categoriesArray
              .filter((cat) => cat.parent_id === category.id)
              .map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = categoriesArray.filter((cat) => !cat.parent_id);

  return (
    <div className="category-sidebar">
      <div className="category-header">
        <h3>Категории</h3>
        <button
          className="category-close-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClose) {
              onClose();
            }
          }}
          title="Закрыть"
        >
          ✕
        </button>
      </div>
      <div className="category-list">
        {rootCategories.length > 0 ? (
          rootCategories.map((category) => renderCategory(category))
        ) : (
          <div className="category-empty">Нет категорий</div>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;

