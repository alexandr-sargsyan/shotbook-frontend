import React, { useState } from 'react';
import './Filters.css';

const Filters = ({ categories = [], onFilterChange, currentFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category_id: currentFilters.category_id || '',
    platform: currentFilters.platform || '',
    pacing: currentFilters.pacing || '',
    production_level: currentFilters.production_level || '',
    has_visual_effects: currentFilters.has_visual_effects || false,
    has_3d: currentFilters.has_3d || false,
    has_animations: currentFilters.has_animations || false,
    has_typography: currentFilters.has_typography || false,
    has_sound_design: currentFilters.has_sound_design || false,
    has_tutorial: currentFilters.has_tutorial || false,
  });

  const handleChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category_id: '',
      platform: '',
      pacing: '',
      production_level: '',
      has_visual_effects: false,
      has_3d: false,
      has_animations: false,
      has_typography: false,
      has_sound_design: false,
      has_tutorial: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== false
  );

  return (
    <div className="filters-container">
      <button
        className="filters-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Filters {hasActiveFilters && <span className="filter-badge">●</span>}
      </button>

      {isOpen && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Platform</label>
            <select
              value={filters.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
            >
              <option value="">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Pacing</label>
            <select
              value={filters.pacing}
              onChange={(e) => handleChange('pacing', e.target.value)}
            >
              <option value="">Any</option>
              <option value="slow">Slow</option>
              <option value="fast">Fast</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Production Level</label>
            <select
              value={filters.production_level}
              onChange={(e) => handleChange('production_level', e.target.value)}
            >
              <option value="">Any</option>
              <option value="low">Low</option>
              <option value="mid">Mid</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="filter-group checkboxes">
            <label>
              <input
                type="checkbox"
                checked={filters.has_visual_effects}
                onChange={(e) => handleChange('has_visual_effects', e.target.checked)}
              />
              Visual Effects
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.has_3d}
                onChange={(e) => handleChange('has_3d', e.target.checked)}
              />
              3D
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.has_animations}
                onChange={(e) => handleChange('has_animations', e.target.checked)}
              />
              Animations
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.has_typography}
                onChange={(e) => handleChange('has_typography', e.target.checked)}
              />
              Typography
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.has_sound_design}
                onChange={(e) => handleChange('has_sound_design', e.target.checked)}
              />
              Sound Design
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.has_tutorial}
                onChange={(e) => handleChange('has_tutorial', e.target.checked)}
              />
              Has Tutorial
            </label>
          </div>

          <button className="filter-reset" onClick={handleReset}>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;

