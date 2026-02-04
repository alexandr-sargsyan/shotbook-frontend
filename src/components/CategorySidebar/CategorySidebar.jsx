import React, { useState, useEffect } from 'react';
import './CategorySidebar.css';

const CategorySidebar = ({
  categories = [],
  selectedCategoryIds = [],
  onCategoryToggle,
  onClose,
  onReset,
  embedded = false,
  isExpanded: externalIsExpanded = undefined // External control for expanded state
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isCategoriesExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;

  // Ensure categories is always an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  // Восстанавливаем состояние открытых категорий из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('expandedCategories');
    if (saved) {
      try {
        setExpandedCategories(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Сохраняем состояние открытых категорий в localStorage
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId],
      };
      localStorage.setItem('expandedCategories', JSON.stringify(newState));
      return newState;
    });
  };

  const handleCheckboxChange = (categoryId, event) => {
    event.stopPropagation();
    if (onCategoryToggle) {
      onCategoryToggle(categoryId);
    }
  };

  const renderCategory = (category, level = 0) => {
    // Проверяем наличие подкатегорий через поле children из API
    const hasChildren = category.children && Array.isArray(category.children) && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];
    const isSelected = selectedCategoryIds.includes(category.id);

    // Увеличенный отступ для явности иерархии (32px на уровень)
    // Removed base offset to align with filters (was + 12)
    const paddingLeft = level * 32;

    return (
      <div key={category.id} className="category-item">
        <div
          className={`category-row ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {/* Чекбокс */}
          <input
            type="checkbox"
            className="category-checkbox"
            checked={isSelected}
            onChange={(e) => handleCheckboxChange(category.id, e)}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Название категории */}
          <label
            className="category-name"
            onClick={() => {
              if (onCategoryToggle) {
                onCategoryToggle(category.id);
              }
            }}
          >
            {category.name}
          </label>

          {/* Стрелка для раскрытия подкатегорий (в конце) */}
          {hasChildren && (
            <button
              className="category-toggle"
              onClick={() => toggleCategory(category.id)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="category-children">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = categoriesArray.filter((cat) => !cat.parent_id);
  const hasSelectedCategories = selectedCategoryIds.length > 0;

  const toggleCategoriesExpanded = () => {
    if (externalIsExpanded === undefined) {
      // Only use internal state if external state is not provided
      setInternalIsExpanded(!internalIsExpanded);
    }
  };

  return (
    <div className={`category-sidebar ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <div 
          className={`category-sidebar-header ${isCategoriesExpanded ? 'expanded' : ''}`}
          onClick={toggleCategoriesExpanded}
        >
          <div className="category-header-content">
            <span className="category-expand-icon">
              {isCategoriesExpanded ? '▼' : '▶'}
            </span>
            <h3>Categories</h3>
          </div>
          {hasSelectedCategories && onReset && (
            <button 
              className="category-reset-btn" 
              onClick={(e) => {
                e.stopPropagation();
                if (onReset) onReset();
              }}
            >
              Reset Categories
            </button>
          )}
        </div>
      )}

      {/* If embedded, we show reset button differently or rely on parent */}
      {embedded && hasSelectedCategories && onReset && (
        <div className="category-embedded-actions">
          <button className="category-reset-btn" onClick={onReset}>
            Reset
          </button>
        </div>
      )}

      <div className={`category-list-container ${embedded ? 'expanded' : (isCategoriesExpanded ? 'expanded' : 'collapsed')}`}>
        <div className="category-list">
          {rootCategories.length > 0 ? (
            rootCategories.map((category) => renderCategory(category))
          ) : (
            <div className="category-empty">No categories</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
