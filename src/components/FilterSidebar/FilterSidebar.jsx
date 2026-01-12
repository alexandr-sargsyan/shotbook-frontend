import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../../services/api';
import './FilterSidebar.css';

const FilterSidebar = ({ categories = [], onFilterChange, currentFilters = {} }) => {
  const [tagSearch, setTagSearch] = useState('');
  const [debouncedTagSearch, setDebouncedTagSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState(
    currentFilters.tag_ids || []
  );
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    platform: currentFilters.platform || '',
    pacing: currentFilters.pacing || '',
    production_level: currentFilters.production_level || '',
    has_visual_effects: currentFilters.has_visual_effects || false,
    has_3d: currentFilters.has_3d || false,
    has_animations: currentFilters.has_animations || false,
    has_typography: currentFilters.has_typography || false,
    has_sound_design: currentFilters.has_sound_design || false,
    has_tutorial: currentFilters.has_tutorial || false,
    tag_ids: currentFilters.tag_ids || [],
  });

  // Debounce для поиска тегов
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTagSearch(tagSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearch]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  // Загрузка тегов с поиском
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', debouncedTagSearch],
    queryFn: async () => {
      const response = await getTags(debouncedTagSearch);
      return response.data;
    },
    enabled: isTagDropdownOpen,
  });

  // Загрузка выбранных тегов для отображения
  const { data: selectedTagsData } = useQuery({
    queryKey: ['tags', 'selected', selectedTagIds],
    queryFn: async () => {
      if (selectedTagIds.length === 0) {
        return { data: [] };
      }
      // Загружаем все теги и фильтруем по выбранным ID
      const response = await getTags('');
      const allTags = response.data.data || [];
      return {
        data: allTags.filter((tag) => selectedTagIds.includes(tag.id)),
      };
    },
    enabled: selectedTagIds.length > 0,
  });

  const tags = tagsData?.data || [];
  const selectedTags = selectedTagsData?.data || [];

  // Синхронизируем с currentFilters при изменении извне
  useEffect(() => {
    const newTagIds = currentFilters.tag_ids || [];
    setSelectedTagIds(newTagIds);
    setFilters({
      platform: currentFilters.platform || '',
      pacing: currentFilters.pacing || '',
      production_level: currentFilters.production_level || '',
      has_visual_effects: currentFilters.has_visual_effects || false,
      has_3d: currentFilters.has_3d || false,
      has_animations: currentFilters.has_animations || false,
      has_typography: currentFilters.has_typography || false,
      has_sound_design: currentFilters.has_sound_design || false,
      has_tutorial: currentFilters.has_tutorial || false,
      tag_ids: newTagIds,
    });
  }, [currentFilters]);

  const handleChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleTagToggle = (tagId) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    
    setSelectedTagIds(newTagIds);
    const newFilters = {
      ...filters,
      tag_ids: newTagIds,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleTagRemove = (tagId) => {
    const newTagIds = selectedTagIds.filter((id) => id !== tagId);
    setSelectedTagIds(newTagIds);
    const newFilters = {
      ...filters,
      tag_ids: newTagIds,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      platform: '',
      pacing: '',
      production_level: '',
      has_visual_effects: false,
      has_3d: false,
      has_animations: false,
      has_typography: false,
      has_sound_design: false,
      has_tutorial: false,
      tag_ids: [],
    };
    setSelectedTagIds([]);
    setTagSearch('');
    setIsTagDropdownOpen(false);
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'tag_ids') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== '' && value !== false;
  });

  return (
    <div className="filter-sidebar">
      <div className="filter-list">
        <div className="filter-group">
          <label>Platform</label>
          <select
            value={filters.platform}
            onChange={(e) => handleChange('platform', e.target.value)}
          >
            <option value="">All platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
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

        <div className="filter-group">
          <label>Tags</label>
          <div className="tag-selector" ref={tagDropdownRef}>
            <div className="tag-search-container">
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setIsTagDropdownOpen(true);
                }}
                onFocus={() => setIsTagDropdownOpen(true)}
                className="tag-search-input"
              />
              {isTagDropdownOpen && (
                <div className="tag-dropdown">
                  {tagsLoading ? (
                    <div className="tag-loading">Loading...</div>
                  ) : tags.length > 0 ? (
                    <div className="tag-list">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className={`tag-option ${
                            selectedTagIds.includes(tag.id) ? 'selected' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTagIds.includes(tag.id)}
                            onChange={() => handleTagToggle(tag.id)}
                          />
                          <span>{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="tag-empty">No tags found</div>
                  )}
                </div>
              )}
            </div>
            {selectedTagIds.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map((tag) => (
                  <span key={tag.id} className="tag-badge">
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag.id)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
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

        {hasActiveFilters && (
          <button className="filter-reset" onClick={handleReset}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;

