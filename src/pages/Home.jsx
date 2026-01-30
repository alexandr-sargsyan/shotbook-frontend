import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import VideoGrid from '../components/VideoGrid/VideoGrid';
import SearchBar from '../components/SearchBar/SearchBar';
import Sidebar from '../components/Sidebar/Sidebar'; // Unified Sidebar
import ActiveFilters from '../components/ActiveFilters/ActiveFilters'; // New component
import Navigation from '../components/Navigation/Navigation';
import Logo from '../components/Logo/Logo';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import EmailVerificationModal from '../components/Auth/EmailVerificationModal';
import { searchVideoReferences, getCategories } from '../services/api';
import './Home.css';

const Home = () => {
  const { isAuthenticated, getAndClearPendingAction } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Unified sidebar state for mobile
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

  // Создаем плоский список всех категорий (включая дочерние) для работы с parent_id
  const allCategories = useMemo(() => {
    const flattenCategories = (categoriesList, flatList = []) => {
      categoriesList.forEach(category => {
        flatList.push(category);
        if (category.children && Array.isArray(category.children) && category.children.length > 0) {
          // Добавляем parent_id к дочерним категориям для удобства
          category.children.forEach(child => {
            child.parent_id = category.id;
          });
          flattenCategories(category.children, flatList);
        }
      });
      return flatList;
    };
    return flattenCategories(categories);
  }, [categories]);

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

  // Remove specific filter
  const handleRemoveFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };

      if (Array.isArray(newFilters[key])) {
        // Remove from array
        newFilters[key] = newFilters[key].filter(item => item !== value);
      } else {
        // Reset boolean or string
        if (typeof value === 'boolean') {
          newFilters[key] = false;
        } else {
          newFilters[key] = undefined; // or empty string
        }
      }
      return newFilters;
    });
  }, []);

  // Remove category wrapper to use handleCategoryToggle
  const handleRemoveCategory = useCallback((categoryId) => {
    // Re-use toggle logic which handles unselection
    handleCategoryToggle(categoryId);
  }, [selectedCategoryIds]); // Need dependencies to be correct in updated logic

  const handleResetAll = useCallback(() => {
    setFilters({});
    setSelectedCategoryIds([]);
    setSearchQuery('');
  }, []);


  // Подсчет количества активных фильтров для бейджика
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'string') {
      return value !== '';
    }
    if (typeof value === 'boolean') {
      return value === true;
    }
    return value !== null && value !== undefined && value !== false && value !== '';
  }).length;

  const hasActiveFilters = activeFiltersCount > 0 || selectedCategoryIds.length > 0;

  // Функция для рекурсивного получения всех дочерних категорий
  const getAllChildCategoryIds = useCallback((categoryId) => {
    const childIds = [];

    const findChildren = (parentId) => {
      allCategories.forEach(category => {
        if (category.parent_id === parentId) {
          childIds.push(category.id);
          // Рекурсивно ищем дочерние для этой категории
          findChildren(category.id);
        }
      });
    };

    findChildren(categoryId);
    return childIds;
  }, [allCategories]);

  // Функция для получения родительской категории
  const getParentCategoryId = useCallback((categoryId) => {
    const category = allCategories.find(cat => cat.id === categoryId);
    return category?.parent_id || null;
  }, [allCategories]);

  // Функция для проверки, является ли категория родительской (имеет дочерние)
  const isParentCategory = useCallback((categoryId) => {
    return allCategories.some(cat => cat.parent_id === categoryId);
  }, [allCategories]);

  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategoryIds((prev) => {
      const isCurrentlySelected = prev.includes(categoryId);

      if (isCurrentlySelected) {
        // Снимаем выбор
        let newIds = prev.filter((id) => id !== categoryId);
        // Получаем все дочерние категории и снимаем с них выбор
        const childIds = getAllChildCategoryIds(categoryId);
        newIds = newIds.filter((id) => !childIds.includes(id));
        return newIds;
      } else {
        // Выбираем категорию
        let newIds = [...prev, categoryId];
        // Если это родительская категория, выбираем все дочерние
        if (isParentCategory(categoryId)) {
          const childIds = getAllChildCategoryIds(categoryId);
          childIds.forEach(childId => {
            if (!newIds.includes(childId)) {
              newIds.push(childId);
            }
          });
        }
        // Если это дочерняя категория и родительская была выбрана, снимаем выбор с родительской
        const parentId = getParentCategoryId(categoryId);
        if (parentId && prev.includes(parentId)) {
          newIds = newIds.filter((id) => id !== parentId);
          // Также снимаем выбор со всех других дочерних этой родительской
          const siblingIds = getAllChildCategoryIds(parentId);
          siblingIds.forEach(siblingId => {
            if (siblingId !== categoryId) {
              newIds = newIds.filter((id) => id !== siblingId);
            }
          });
        }
        return newIds;
      }
    });
  }, [getAllChildCategoryIds, getParentCategoryId, isParentCategory]);

  const videos = videosData?.data || [];

  const handleAuthRequired = () => {
    setShowRegisterModal(true);
  };

  // Выполняем pending action после авторизации
  useEffect(() => {
    if (isAuthenticated()) {
      const pendingAction = getAndClearPendingAction?.();
      if (pendingAction) {
        console.log('Pending action:', pendingAction);
      }
    }
  }, [isAuthenticated, getAndClearPendingAction]);

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
            className={`mobile-menu-btn ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Menu & Filters"
          >
            {isSidebarOpen ? '✕' : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            )}
            {hasActiveFilters && (
              <span className="filter-badge"></span>
            )}
          </button>
          <SearchBar onSearch={handleSearch} />
        </div>
        <Navigation />
      </div>

      {/* Unified Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryToggle={handleCategoryToggle}
        onResetCategories={() => setSelectedCategoryIds([])}
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="home-content">
        <div className="video-content">
          <ActiveFilters
            filters={filters}
            categories={allCategories}
            selectedCategoryIds={selectedCategoryIds}
            onRemoveFilter={handleRemoveFilter}
            onRemoveCategory={handleCategoryToggle} // Reusing toggle for removal
            onResetAll={handleResetAll}
          />

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
