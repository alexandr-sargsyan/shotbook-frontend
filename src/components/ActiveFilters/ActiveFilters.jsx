import React from 'react';
import './ActiveFilters.css';

const ActiveFilters = ({
    filters = {},
    categories = [],
    selectedCategoryIds = [],
    hooks = [],
    tags = [],
    transitionTypes = [],
    onRemoveFilter,
    onRemoveCategory,
    onResetAll
}) => {
    const activeFilters = [];

    // Helper to find category name
    // Works with flat array (allCategories) - just find by ID
    const findCategoryName = (id, cats) => {
        // First try to find in flat array (allCategories)
        const category = cats.find(cat => cat.id === id);
        if (category && category.name) {
            return category.name;
        }
        
        // Fallback: try recursive search for hierarchical structure (if needed)
        for (const cat of cats) {
            if (cat.id === id) return cat.name;
            if (cat.children) {
                const name = findCategoryName(id, cat.children);
                if (name) return name;
            }
        }
        
        // Last resort: return fallback
        return `Category ${id}`;
    };

    // Categories
    if (selectedCategoryIds.length > 0) {
        selectedCategoryIds.forEach(id => {
            activeFilters.push({
                key: `category-${id}`,
                label: findCategoryName(id, categories),
                type: 'category',
                onRemove: () => onRemoveCategory(id)
            });
        });
    }

    // Platforms
    if (filters.platform && filters.platform.length > 0) {
        filters.platform.forEach(p => {
            activeFilters.push({
                key: `platform-${p}`,
                label: `Platform: ${p.charAt(0).toUpperCase() + p.slice(1)}`,
                type: 'filter',
                onRemove: () => onRemoveFilter('platform', p)
            });
        });
    }

    // Pacing
    if (filters.pacing && filters.pacing.length > 0) {
        filters.pacing.forEach(p => {
            activeFilters.push({
                key: `pacing-${p}`,
                label: `Pacing: ${p}`,
                type: 'filter',
                onRemove: () => onRemoveFilter('pacing', p)
            });
        });
    }

    // Production Level
    if (filters.production_level && filters.production_level.length > 0) {
        filters.production_level.forEach(l => {
            activeFilters.push({
                key: `prod-${l}`,
                label: `Prod: ${l}`,
                type: 'filter',
                onRemove: () => onRemoveFilter('production_level', l)
            });
        });
    }

    // Boolean filters
    const booleanFilters = [
        { key: 'has_visual_effects', label: 'Visual Effects' },
        { key: 'has_3d', label: '3D' },
        { key: 'has_animations', label: 'Animations' },
        { key: 'has_typography', label: 'Typography' },
        { key: 'has_sound_design', label: 'Sound Design' },
        { key: 'has_ai', label: 'AI' },
        { key: 'has_tutorial', label: 'Has Tutorial' },
    ];

    booleanFilters.forEach(({ key, label }) => {
        if (filters[key]) {
            activeFilters.push({
                key: key,
                label: label,
                type: 'filter',
                onRemove: () => onRemoveFilter(key, false)
            });
        }
    });

    // Hooks
    if (filters.hook_ids && filters.hook_ids.length > 0) {
        filters.hook_ids.forEach(hookId => {
            const hook = hooks.find(h => h.id === hookId);
            if (hook) {
                activeFilters.push({
                    key: `hook-${hookId}`,
                    label: `Hook: ${hook.name}`,
                    type: 'filter',
                    onRemove: () => onRemoveFilter('hook_ids', hookId)
                });
            }
        });
    }

    // Tags
    if (filters.tag_ids && filters.tag_ids.length > 0) {
        filters.tag_ids.forEach(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (tag) {
                activeFilters.push({
                    key: `tag-${tagId}`,
                    label: `Tag: ${tag.name}`,
                    type: 'filter',
                    onRemove: () => onRemoveFilter('tag_ids', tagId)
                });
            }
        });
    }

    // Transition Types
    if (filters.transition_type_ids && filters.transition_type_ids.length > 0) {
        filters.transition_type_ids.forEach(ttId => {
            const tt = transitionTypes.find(t => t.id === ttId);
            if (tt) {
                activeFilters.push({
                    key: `transition-${ttId}`,
                    label: `Transition: ${tt.name}`,
                    type: 'filter',
                    onRemove: () => onRemoveFilter('transition_type_ids', ttId)
                });
            }
        });
    }

    if (activeFilters.length === 0) return null;

    return (
        <div className="active-filters-container">
            {activeFilters.map(filter => (
                <span key={filter.key} className="active-filter-badge">
                    {filter.label}
                    <button onClick={filter.onRemove} aria-label="Remove filter">×</button>
                </span>
            ))}

            {activeFilters.length > 0 && (
                <button className="clear-all-btn" onClick={onResetAll}>
                    Clear all
                </button>
            )}
        </div>
    );
};

export default ActiveFilters;
