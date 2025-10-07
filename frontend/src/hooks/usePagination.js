import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function usePagination({
  defaultPage = 1,
  defaultLimit = 10,
  defaultFilters = {},
  onDataChange = null
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États de pagination
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam) : defaultPage;
  });
  
  const [limit, setLimit] = useState(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? parseInt(limitParam) : defaultLimit;
  });
  
  // États de filtrage
  const [filters, setFilters] = useState(() => {
    const filterState = { ...defaultFilters };
    
    // Récupérer les filtres depuis l'URL
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page' && key !== 'limit') {
        filterState[key] = value;
      }
    }
    
    return filterState;
  });
  
  // États de données
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Calculer les informations de pagination
  const paginationInfo = useMemo(() => {
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, totalItems);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
      isEmpty: data.length === 0,
      isFirstPage: page === 1,
      isLastPage: page === totalPages
    };
  }, [page, limit, totalItems, totalPages, data.length]);
  
  // Fonction pour mettre à jour les paramètres URL
  const updateUrlParams = useCallback((newPage, newLimit, newFilters) => {
    const params = new URLSearchParams();
    
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());
    
    // Ajouter les filtres non vides
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  }, [setSearchParams]);
  
  // Fonctions de navigation
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      updateUrlParams(newPage, limit, filters);
    }
  }, [page, totalPages, limit, filters, updateUrlParams]);
  
  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      goToPage(page + 1);
    }
  }, [paginationInfo.hasNextPage, goToPage, page]);
  
  const goToPreviousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      goToPage(page - 1);
    }
  }, [paginationInfo.hasPreviousPage, goToPage, page]);
  
  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);
  
  // Changer la limite d'éléments par page
  const changeLimit = useCallback((newLimit) => {
    const newPage = 1; // Retourner à la première page
    setLimit(newLimit);
    setPage(newPage);
    updateUrlParams(newPage, newLimit, filters);
  }, [filters, updateUrlParams]);
  
  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters, resetPage = true) => {
    const updatedFilters = { ...filters, ...newFilters };
    const newPage = resetPage ? 1 : page;
    
    setFilters(updatedFilters);
    if (resetPage) {
      setPage(newPage);
    }
    
    updateUrlParams(newPage, limit, updatedFilters);
  }, [filters, page, limit, updateUrlParams]);
  
  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
    updateUrlParams(1, limit, defaultFilters);
  }, [defaultFilters, limit, updateUrlParams]);
  
  // Fonction de recherche
  const search = useCallback((searchTerm, searchField = 'search') => {
    updateFilters({ [searchField]: searchTerm });
  }, [updateFilters]);
  
  // Fonction pour charger les données (à implémenter par le composant)
  const setDataResult = useCallback((result) => {
    if (result && typeof result === 'object') {
      const data = result.data || result.items || result;
      const total = result.total || result.totalItems || 0;
      const totalPages = result.totalPages || result.pages || Math.ceil((result.total || 0) / limit);
      
      setData(data);
      setTotalItems(total);
      setTotalPages(totalPages);
    } else {
      setData([]);
      setTotalItems(0);
      setTotalPages(0);
    }
    
    if (onDataChange) {
      onDataChange(result);
    }
  }, [limit, onDataChange]);
  
  // Fonction utilitaire pour créer les paramètres de requête
  const getQueryParams = useMemo(() => ({
    page,
    limit,
    ...filters
  }), [page, limit, filters]);
  
  // Générer les numéros de page pour la pagination
  const getPageNumbers = useCallback((maxVisible = 5) => {
    const pages = [];
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Ajuster le début si on est proche de la fin
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [page, totalPages]);
  
  return {
    // États
    page,
    limit,
    filters,
    data,
    loading,
    error,
    totalItems,
    totalPages,
    
    // Informations calculées
    ...paginationInfo,
    
    // Fonctions de navigation
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    
    // Fonctions de configuration
    changeLimit,
    updateFilters,
    resetFilters,
    search,
    
    // Fonctions de données
    setLoading,
    setError,
    setDataResult,
    getQueryParams,
    getPageNumbers
  };
}

export default usePagination;