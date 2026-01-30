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
                        <div className="sidebar-section-header">
                            <h3>Categories</h3>
                        </div>
                        <div className="sidebar-section-body">
                            <CategorySidebar
                                categories={categories}
                                selectedCategoryIds={selectedCategoryIds}
                                onCategoryToggle={onCategoryToggle}
                                onReset={onResetCategories}
                                embedded={true} // New prop to indicate embedded mode
                            />
                        </div>
                    </div>

                    <div className="sidebar-divider"></div>

                    {/* Filters Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-section-header">
                            <h3>Filters</h3>
                        </div>
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
