import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import CategorySidebar from '../components/CategorySidebar/CategorySidebar';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import SearchBar from '../components/SearchBar/SearchBar';
import Filters from '../components/Filters/Filters';
import { searchVideoReferences, getCategories } from '../services/api';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories();
      return response.data;
    },
  });

  // Build query params
  const queryParams = {
    ...filters,
  };

  // Add search query if exists
  if (searchQuery) {
    queryParams.search = searchQuery;
  }

  // Add category_id from selectedCategoryId if exists (overrides filters.category_id)
  if (selectedCategoryId) {
    queryParams.category_id = selectedCategoryId;
  } else if (filters.category_id) {
    queryParams.category_id = filters.category_id;
  }

  // Remove undefined and empty values
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === false) {
      delete queryParams[key];
    }
  });

  // Fetch videos
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videoReferences', queryParams],
    queryFn: async () => {
      const response = await searchVideoReferences(searchQuery, queryParams);
      return response.data;
    },
  });

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Clear selectedCategoryId when filters change manually (if category_id was removed)
    if (!newFilters.category_id && selectedCategoryId) {
      setSelectedCategoryId(null);
    }
  }, [selectedCategoryId]);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategoryId(categoryId);
    // Update filters to sync with category selection
    if (categoryId) {
      setFilters((prev) => ({ ...prev, category_id: categoryId }));
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.category_id;
        return newFilters;
      });
    }
  }, []);

  const videos = videosData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <div className="home-page">
      <div className="home-header">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
        </div>
        <Filters
          categories={categories}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      <div className="home-content">
        <div className={`category-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <CategorySidebar
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
          />
          {sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>

        <div className="video-content">
          <VideoGrid videos={videos} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Home;

