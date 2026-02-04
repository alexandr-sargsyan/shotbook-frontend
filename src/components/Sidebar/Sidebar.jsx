import React, { useState } from 'react';
import CategorySidebar from '../CategorySidebar/CategorySidebar';
import FilterSidebar from '../FilterSidebar/FilterSidebar';
import './Sidebar.css';

const Sidebar = ({
    categories,
    selectedCategoryIds,
    onCategoryToggle,
    onResetCategories,
    filters,
    onFilterChange,
    isOpen,
    onClose
}) => {
    const [activeSection, setActiveSection] = useState('all'); // 'all', 'categories', 'filters'
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

    const toggleCategoriesExpanded = () => {
        setIsCategoriesExpanded(!isCategoriesExpanded);
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            <aside className={`main-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    {/* Categories Section */}
                    <div className="sidebar-section">
                        <div 
                            className={`sidebar-section-header ${isCategoriesExpanded ? 'expanded' : ''}`}
                            onClick={toggleCategoriesExpanded}
                        >
                            <div className="sidebar-header-content">
                                <span className="sidebar-expand-icon">
                                    {isCategoriesExpanded ? '▼' : '▶'}
                                </span>
                                <h3>Categories</h3>
                            </div>
                        </div>
                        <div className={`sidebar-section-body ${isCategoriesExpanded ? 'expanded' : 'collapsed'}`}>
                            <CategorySidebar
                                categories={categories}
                                selectedCategoryIds={selectedCategoryIds}
                                onCategoryToggle={onCategoryToggle}
                                onReset={onResetCategories}
                                embedded={true} // New prop to indicate embedded mode
                                isExpanded={isCategoriesExpanded} // Pass expanded state
                            />
                        </div>
                    </div>

                    <div className="sidebar-divider"></div>

                    {/* Filters Section */}
                    <div className="sidebar-section">
                        {/* Removed header as requested */}
                        <div className="sidebar-section-body">
                            <FilterSidebar
                                categories={categories} // FilterSidebar might use categories too?
                                currentFilters={filters}
                                onFilterChange={onFilterChange}
                                embedded={true} // New prop
                            />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
