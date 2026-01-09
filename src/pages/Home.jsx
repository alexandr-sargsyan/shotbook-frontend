import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import SearchBar from '../components/SearchBar/SearchBar';
import Filters from '../components/Filters/Filters';
import CategorySidebar from '../components/CategorySidebar/CategorySidebar';
import { searchVideoReferences, getCategories } from '../services/api';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories();
      return response.data;
    },
  });

  const categories = categoriesData?.data || [];

  // Build query params
  const queryParams = {
    ...filters,
  };

  // Add search query if exists
  if (searchQuery) {
    queryParams.search = searchQuery;
  }

  // Add selected category IDs to filters
  if (selectedCategoryIds.length > 0) {
    // Если выбрано несколько категорий, отправляем массив
    queryParams.category_id = selectedCategoryIds.length === 1 
      ? selectedCategoryIds[0] 
      : selectedCategoryIds;
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
  }, []);

  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  const videos = videosData?.data || [];

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="search-container">
          <button
            className={`categories-toggle-btn ${selectedCategoryIds.length > 0 ? 'has-filters' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Закрыть" : "Открыть"}
          >
            {sidebarOpen ? '✕' : '☰'}
            {selectedCategoryIds.length > 0 && (
              <span className="filter-badge"></span>
            )}
          </button>
          <SearchBar onSearch={handleSearch} />
        </div>
        <Filters
          categories={[]}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Боковая панель с категориями */}
      {sidebarOpen && (
        <div className="empty-sidebar">
          <CategorySidebar
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onCategoryToggle={handleCategoryToggle}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="home-content">
        <div className="video-content">
          <VideoGrid videos={videos} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Home;

