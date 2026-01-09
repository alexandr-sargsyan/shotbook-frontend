import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import SearchBar from '../components/SearchBar/SearchBar';
import Filters from '../components/Filters/Filters';
import { searchVideoReferences } from '../services/api';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Build query params
  const queryParams = {
    ...filters,
  };

  // Add search query if exists
  if (searchQuery) {
    queryParams.search = searchQuery;
  }

  // Add category_id from filters if exists
  if (filters.category_id) {
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
  }, []);

  const videos = videosData?.data || [];

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="search-container">
          <button
            className="categories-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Закрыть" : "Открыть"}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <SearchBar onSearch={handleSearch} />
        </div>
        <Filters
          categories={[]}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Пустая боковая панель */}
      {sidebarOpen && (
        <div className="empty-sidebar">
          {/* Пустая панель */}
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

