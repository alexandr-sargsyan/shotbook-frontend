import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTags, getHooks, getTransitionTypes } from '../../services/api';
import './FilterSidebar.css';

const FilterSidebar = ({
  categories = [],
  onFilterChange,
  currentFilters = {},
  embedded = false
}) => {
  const [tagSearch, setTagSearch] = useState('');
  const [debouncedTagSearch, setDebouncedTagSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState(
    currentFilters.tag_ids || []
  );
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef(null);

  const [transitionTypeSearch, setTransitionTypeSearch] = useState('');
  const [debouncedTransitionTypeSearch, setDebouncedTransitionTypeSearch] = useState('');
  const [selectedTransitionTypeIds, setSelectedTransitionTypeIds] = useState(
    currentFilters.transition_type_ids || []
  );
  const [isTransitionTypeDropdownOpen, setIsTransitionTypeDropdownOpen] = useState(false);
  const transitionTypeDropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    platform: currentFilters.platform || [],
    pacing: Array.isArray(currentFilters.pacing) ? currentFilters.pacing : (currentFilters.pacing ? [currentFilters.pacing] : []),
    production_level: Array.isArray(currentFilters.production_level) ? currentFilters.production_level : (currentFilters.production_level ? [currentFilters.production_level] : []),
    hook_ids: currentFilters.hook_ids || [],
    has_visual_effects: currentFilters.has_visual_effects || false,
    has_3d: currentFilters.has_3d || false,
    has_animations: currentFilters.has_animations || false,
    has_typography: currentFilters.has_typography || false,
    has_sound_design: currentFilters.has_sound_design || false,
    has_ai: currentFilters.has_ai || false,
    has_tutorial: currentFilters.has_tutorial || false,
    tag_ids: currentFilters.tag_ids || [],
    transition_type_ids: currentFilters.transition_type_ids || [],
  });

  // Debounce для поиска тегов
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTagSearch(tagSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearch]);

  // Debounce для поиска transition types
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTransitionTypeSearch(transitionTypeSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [transitionTypeSearch]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
      if (transitionTypeDropdownRef.current && !transitionTypeDropdownRef.current.contains(event.target)) {
        setIsTransitionTypeDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen || isTransitionTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen, isTransitionTypeDropdownOpen]);

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

  // Загрузка transition types с поиском
  const { data: transitionTypesData, isLoading: transitionTypesLoading } = useQuery({
    queryKey: ['transitionTypes', debouncedTransitionTypeSearch],
    queryFn: async () => {
      const response = await getTransitionTypes(debouncedTransitionTypeSearch);
      return response.data;
    },
    enabled: isTransitionTypeDropdownOpen,
  });

  // Загрузка выбранных transition types для отображения
  const { data: selectedTransitionTypesData } = useQuery({
    queryKey: ['transitionTypes', 'selected', selectedTransitionTypeIds],
    queryFn: async () => {
      if (selectedTransitionTypeIds.length === 0) {
        return { data: [] };
      }
      // Загружаем все transition types и фильтруем по выбранным ID
      const response = await getTransitionTypes('');
      const allTransitionTypes = response.data.data || [];
      return {
        data: allTransitionTypes.filter((tt) => selectedTransitionTypeIds.includes(tt.id)),
      };
    },
    enabled: selectedTransitionTypeIds.length > 0,
  });

  // Загрузка хуков
  const { data: hooksData } = useQuery({
    queryKey: ['hooks'],
    queryFn: async () => {
      const response = await getHooks();
      return response.data;
    },
  });

  const tags = tagsData?.data || [];
  const selectedTags = selectedTagsData?.data || [];
  const transitionTypes = transitionTypesData?.data || [];
  const selectedTransitionTypes = selectedTransitionTypesData?.data || [];
  const hooks = hooksData?.data || [];

  // Синхронизируем с currentFilters при изменении извне
  useEffect(() => {
    const newTagIds = currentFilters.tag_ids || [];
    const newTransitionTypeIds = currentFilters.transition_type_ids || [];
    setSelectedTagIds(newTagIds);
    setSelectedTransitionTypeIds(newTransitionTypeIds);
    setFilters({
      platform: currentFilters.platform || [],
      pacing: Array.isArray(currentFilters.pacing) ? currentFilters.pacing : (currentFilters.pacing ? [currentFilters.pacing] : []),
      production_level: Array.isArray(currentFilters.production_level) ? currentFilters.production_level : (currentFilters.production_level ? [currentFilters.production_level] : []),
      hook_ids: currentFilters.hook_ids || [],
      has_visual_effects: currentFilters.has_visual_effects || false,
      has_3d: currentFilters.has_3d || false,
      has_animations: currentFilters.has_animations || false,
      has_typography: currentFilters.has_typography || false,
      has_sound_design: currentFilters.has_sound_design || false,
      has_ai: currentFilters.has_ai || false,
      has_tutorial: currentFilters.has_tutorial || false,
      tag_ids: newTagIds,
      transition_type_ids: newTransitionTypeIds,
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

  const handleTransitionTypeToggle = (transitionTypeId) => {
    const newTransitionTypeIds = selectedTransitionTypeIds.includes(transitionTypeId)
      ? selectedTransitionTypeIds.filter((id) => id !== transitionTypeId)
      : [...selectedTransitionTypeIds, transitionTypeId];
    
    setSelectedTransitionTypeIds(newTransitionTypeIds);
    const newFilters = {
      ...filters,
      transition_type_ids: newTransitionTypeIds,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleTransitionTypeRemove = (transitionTypeId) => {
    const newTransitionTypeIds = selectedTransitionTypeIds.filter((id) => id !== transitionTypeId);
    setSelectedTransitionTypeIds(newTransitionTypeIds);
    const newFilters = {
      ...filters,
      transition_type_ids: newTransitionTypeIds,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handlePlatformToggle = (platformValue) => {
    const newPlatforms = filters.platform.includes(platformValue)
      ? filters.platform.filter((p) => p !== platformValue)
      : [...filters.platform, platformValue];

    const newFilters = {
      ...filters,
      platform: newPlatforms,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };


  const handlePacingToggle = (pacingValue) => {
    const newPacing = filters.pacing.includes(pacingValue)
      ? filters.pacing.filter((p) => p !== pacingValue)
      : [...filters.pacing, pacingValue];

    const newFilters = {
      ...filters,
      pacing: newPacing,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleProductionLevelToggle = (levelValue) => {
    const newLevels = filters.production_level.includes(levelValue)
      ? filters.production_level.filter((l) => l !== levelValue)
      : [...filters.production_level, levelValue];

    const newFilters = {
      ...filters,
      production_level: newLevels,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleHookToggle = (hookId) => {
    const newHookIds = filters.hook_ids.includes(hookId)
      ? filters.hook_ids.filter((id) => id !== hookId)
      : [...filters.hook_ids, hookId];

    const newFilters = {
      ...filters,
      hook_ids: newHookIds,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      platform: [],
      pacing: [],
      production_level: [],
      hook_ids: [],
      has_visual_effects: false,
      has_3d: false,
      has_animations: false,
      has_typography: false,
      has_sound_design: false,
      has_ai: false,
      has_tutorial: false,
      tag_ids: [],
      transition_type_ids: [],
    };
    setSelectedTagIds([]);
    setTagSearch('');
    setIsTagDropdownOpen(false);
    setSelectedTransitionTypeIds([]);
    setTransitionTypeSearch('');
    setIsTransitionTypeDropdownOpen(false);
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'tag_ids' || key === 'transition_type_ids' || key === 'platform' || key === 'pacing' || key === 'production_level' || key === 'hook_ids') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== '' && value !== false;
  });

  return (
    <div className={`filter-sidebar ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <div className="filter-sidebar-header">
          <h3>Filters</h3>
          {hasActiveFilters && (
            <button className="filter-reset-btn" onClick={handleReset}>
              Reset Filters
            </button>
          )}
        </div>
      )}

      {embedded && hasActiveFilters && (
        <div className="filter-embedded-actions">
          <button className="filter-reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}

      <div className="filter-list">
        <div className="filter-group checkboxes">
          <label>Platform</label>
          <div className="platform-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={filters.platform.includes('youtube')}
                onChange={() => handlePlatformToggle('youtube')}
              />
              YouTube
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.platform.includes('instagram')}
                onChange={() => handlePlatformToggle('instagram')}
              />
              Instagram
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.platform.includes('tiktok')}
                onChange={() => handlePlatformToggle('tiktok')}
              />
              TikTok
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.platform.includes('facebook')}
                onChange={() => handlePlatformToggle('facebook')}
              />
              Facebook
            </label>
          </div>
        </div>

        <div className="filter-group checkboxes">
          <label>Pacing</label>
          <div className="pacing-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={filters.pacing.includes('slow')}
                onChange={() => handlePacingToggle('slow')}
              />
              Slow
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.pacing.includes('fast')}
                onChange={() => handlePacingToggle('fast')}
              />
              Fast
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.pacing.includes('mixed')}
                onChange={() => handlePacingToggle('mixed')}
              />
              Mixed
            </label>
          </div>
        </div>

        <div className="filter-group checkboxes">
          <label>Production Level</label>
          <div className="production-level-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={filters.production_level.includes('low')}
                onChange={() => handleProductionLevelToggle('low')}
              />
              Low
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.production_level.includes('mid')}
                onChange={() => handleProductionLevelToggle('mid')}
              />
              Mid
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.production_level.includes('high')}
                onChange={() => handleProductionLevelToggle('high')}
              />
              High
            </label>
          </div>
        </div>

        <div className="filter-group checkboxes">
          <label>Hooks</label>
          {hooks.map((hook) => (
            <label key={hook.id}>
              <input
                type="checkbox"
                checked={filters.hook_ids.includes(hook.id)}
                onChange={() => handleHookToggle(hook.id)}
              />
              {hook.name}
            </label>
          ))}
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
                          className={`tag-option ${selectedTagIds.includes(tag.id) ? 'selected' : ''
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

        <div className="filter-group">
          <label>Transition Types</label>
          <div className="tag-selector" ref={transitionTypeDropdownRef}>
            <div className="tag-search-container">
              <input
                type="text"
                placeholder="Search transition types..."
                value={transitionTypeSearch}
                onChange={(e) => {
                  setTransitionTypeSearch(e.target.value);
                  setIsTransitionTypeDropdownOpen(true);
                }}
                onFocus={() => setIsTransitionTypeDropdownOpen(true)}
                className="tag-search-input"
              />
              {isTransitionTypeDropdownOpen && (
                <div className="tag-dropdown">
                  {transitionTypesLoading ? (
                    <div className="tag-loading">Loading...</div>
                  ) : transitionTypes.length > 0 ? (
                    <div className="tag-list">
                      {transitionTypes.map((tt) => (
                        <label
                          key={tt.id}
                          className={`tag-option ${
                            selectedTransitionTypeIds.includes(tt.id) ? 'selected' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTransitionTypeIds.includes(tt.id)}
                            onChange={() => handleTransitionTypeToggle(tt.id)}
                          />
                          <span>{tt.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="tag-empty">No transition types found</div>
                  )}
                </div>
              )}
            </div>
            {selectedTransitionTypeIds.length > 0 && (
              <div className="selected-tags">
                {selectedTransitionTypes.map((tt) => (
                  <span key={tt.id} className="tag-badge">
                    {tt.name}
                    <button
                      type="button"
                      onClick={() => handleTransitionTypeRemove(tt.id)}
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
              checked={filters.has_ai}
              onChange={(e) => handleChange('has_ai', e.target.checked)}
            />
            AI
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
      </div>
    </div>
  );
};

export default FilterSidebar;
