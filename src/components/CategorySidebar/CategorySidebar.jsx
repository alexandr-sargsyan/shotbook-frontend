import React, { useState, useEffect } from 'react';
import './CategorySidebar.css';

const CategorySidebar = ({ categories = [], selectedCategoryIds = [], onCategoryToggle, onClose, onReset }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

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

    return (
      <div key={category.id} className="category-item">
        <div
          className={`category-row ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
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

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-header">
        <h3>Categories</h3>
        {hasSelectedCategories && onReset && (
          <button className="category-reset-btn" onClick={onReset}>
            Reset Categories
          </button>
        )}
      </div>
      <div className="category-list">
        {rootCategories.length > 0 ? (
          rootCategories.map((category) => renderCategory(category))
        ) : (
          <div className="category-empty">No categories</div>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;

