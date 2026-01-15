import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import SearchBar from '../components/SearchBar/SearchBar';
import CategorySidebar from '../components/CategorySidebar/CategorySidebar';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import Navigation from '../components/Navigation/Navigation';
import Logo from '../components/Logo/Logo';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import EmailVerificationModal from '../components/Auth/EmailVerificationModal';
import { searchVideoReferences, getCategories } from '../services/api';
import './Home.css';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersSidebarOpen, setFiltersSidebarOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [codeAlreadySent, setCodeAlreadySent] = useState(false);

  // Обработка URL параметра category_ids при загрузке страницы или изменении URL
  useEffect(() => {
    const categoryIdsParam = searchParams.getAll('category_ids[]');
    if (categoryIdsParam.length > 0) {
      const categoryIds = categoryIdsParam
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id));
      if (categoryIds.length > 0) {
        setSelectedCategoryIds(categoryIds);
      }
    }
  }, [searchParams]);

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
    queryParams.category_ids = selectedCategoryIds;
  }

  // Remove undefined and empty values
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === false) {
      delete queryParams[key];
    }
    // Удаляем пустые массивы
    if (Array.isArray(queryParams[key]) && queryParams[key].length === 0) {
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

  // Подсчет количества активных фильтров
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // Проверяем массивы (platform, tag_ids, pacing, production_level)
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    // Проверяем строки (hook_type и другие строковые поля)
    if (typeof value === 'string') {
      return value !== '';
    }
    // Проверяем булевы значения (has_visual_effects, has_3d, etc.)
    if (typeof value === 'boolean') {
      return value === true;
    }
    // Игнорируем null, undefined, false, пустые строки
    return value !== null && value !== undefined && value !== false && value !== '';
  }).length;

  const hasActiveFilters = activeFiltersCount > 0;

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

  const handleAuthRequired = () => {
    setShowRegisterModal(true);
  };

  const handleLoginSuccess = (data) => {
    if (data?.showVerification) {
      setVerificationEmail(data.email);
      setShowVerificationModal(true);
    }
  };

  const handleRegisterSuccess = (data) => {
    if (data?.showVerification) {
      setVerificationEmail(data.email);
      setShowVerificationModal(true);
      // Код уже отправлен при регистрации, передаем это в модалку
      setCodeAlreadySent(true);
    }
  };

  const handleVerificationSuccess = (data) => {
    if (data?.showLogin) {
      setVerificationEmail(data.email);
      setShowLoginModal(true);
    }
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <Logo />
        <div className="search-container">
          <button
            className={`categories-toggle-btn ${selectedCategoryIds.length > 0 ? 'has-filters' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close" : "Open"}
          >
            {sidebarOpen ? '✕' : '☰'}
            {selectedCategoryIds.length > 0 && (
              <span className="filter-badge">{selectedCategoryIds.length}</span>
            )}
          </button>
          <SearchBar onSearch={handleSearch} />
          <button
            className={`filters-toggle-btn ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={() => setFiltersSidebarOpen(!filtersSidebarOpen)}
            title={filtersSidebarOpen ? "Close" : "Open"}
          >
            {filtersSidebarOpen ? '✕' : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Верхний слайдер */}
                <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="14" cy="6" r="2.5" fill="currentColor"/>
                {/* Нижний слайдер */}
                <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="6" cy="14" r="2.5" fill="currentColor"/>
              </svg>
            )}
            {hasActiveFilters && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
          </button>
        </div>
        <Navigation />
      </div>

      {/* Боковая панель с категориями (слева) */}
      {sidebarOpen && (
        <div className="empty-sidebar">
          <CategorySidebar
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onCategoryToggle={handleCategoryToggle}
            onClose={() => setSidebarOpen(false)}
            onReset={() => setSelectedCategoryIds([])}
          />
        </div>
      )}

      {/* Боковая панель с фильтрами (справа) */}
      {filtersSidebarOpen && (
        <div className="filters-sidebar">
          <FilterSidebar
            categories={categories}
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </div>
      )}

      <div className="home-content">
        <div className="video-content">
          <VideoGrid 
            videos={videos} 
            loading={isLoading} 
            onAuthRequired={handleAuthRequired}
            queryParams={queryParams}
            pagination={videosData?.meta}
          />
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onSuccess={handleLoginSuccess}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
        onSuccess={handleRegisterSuccess}
      />

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setCodeAlreadySent(false);
        }}
        email={verificationEmail}
        codeAlreadySent={codeAlreadySent}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default Home;

