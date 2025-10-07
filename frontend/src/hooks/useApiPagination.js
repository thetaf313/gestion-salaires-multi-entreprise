import { useEffect, useCallback, useMemo } from 'react';
import { usePagination } from './usePagination';

export function useApiPagination({
  apiFunction,
  dependencies = [],
  defaultFilters = {},
  defaultLimit = 10,
  autoLoad = true,
  onSuccess = null,
  onError = null
}) {
  const pagination = usePagination({
    defaultLimit,
    defaultFilters
  });

  const {
    page,
    limit,
    filters,
    setLoading,
    setError,
    setDataResult
  } = pagination;

  // Memoize les paramètres de la requête pour éviter les re-renders
  const queryParams = useMemo(() => ({
    page,
    limit,
    ...filters
  }), [page, limit, filters]);

  // Fonction pour charger les données
  const loadData = useCallback(async (customParams = {}) => {
    if (!apiFunction) return;

    try {
      setLoading(true);
      setError(null);

      const params = { ...queryParams, ...customParams };
      const result = await apiFunction(params);

      setDataResult(result);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError(error.message || 'Erreur lors du chargement des données');
      setDataResult({ data: [], total: 0 });

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, queryParams, setLoading, setError, setDataResult]); // Removed onSuccess, onError from deps

  // Fonction de rechargement
  const reload = useCallback((customParams = {}) => {
    loadData(customParams);
  }, [loadData]);

  // Chargement automatique lors des changements
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [loadData, autoLoad, ...dependencies]);

  return {
    ...pagination,
    loadData,
    reload,
    refetch: reload
  };
}

export default useApiPagination;