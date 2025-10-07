/**
 * Adaptateur pour normaliser les réponses de pagination du backend
 * Convertit différentes structures en format uniforme pour le frontend
 */

export const adaptPaginationResponse = (response, params = {}) => {
  // Vérifier d'abord si c'est une réponse avec wrapper (success, message, data)
  if (response.success && response.data) {
    // Extraire les vraies données du wrapper
    const actualData = response.data;
    
    // Cas 1: Structure Employee Controller { employees, pagination: { totalItems, totalPages, ... } }
    if (actualData.employees && actualData.pagination) {
      return {
        data: actualData.employees,
        total: actualData.pagination.totalItems || 0,
        totalPages: actualData.pagination.totalPages || Math.ceil((actualData.pagination.totalItems || 0) / (params.limit || 10))
      };
    }

    // Cas 2: Structure PayRun Service { data, pagination: { total, totalPages, ... } }
    if (actualData.data && actualData.pagination) {
      return {
        data: actualData.data,
        total: actualData.pagination.total || 0,
        totalPages: actualData.pagination.totalPages || Math.ceil((actualData.pagination.total || 0) / (params.limit || 10))
      };
    }

    // Cas 3: Structure Attendance/Payslip/Users { attendances/payslips/users, pagination: { total, totalPages, ... } }
    if (actualData.attendances && actualData.pagination) {
      return {
        data: actualData.attendances,
        total: actualData.pagination.total || 0,
        totalPages: actualData.pagination.totalPages || Math.ceil((actualData.pagination.total || 0) / (params.limit || 10))
      };
    }

    if (actualData.payslips && actualData.pagination) {
      return {
        data: actualData.payslips,
        total: actualData.pagination.total || 0,
        totalPages: actualData.pagination.totalPages || Math.ceil((actualData.pagination.total || 0) / (params.limit || 10))
      };
    }

    if (actualData.users && actualData.pagination) {
      return {
        data: actualData.users,
        total: actualData.pagination.totalItems || actualData.pagination.total || 0,
        totalPages: actualData.pagination.totalPages || Math.ceil((actualData.pagination.totalItems || actualData.pagination.total || 0) / (params.limit || 10))
      };
    }

    // Si actualData est directement un tableau
    if (Array.isArray(actualData)) {
      return {
        data: actualData,
        total: actualData.length,
        totalPages: 1
      };
    }
  }

  // Cas sans wrapper - structures directes
  // Cas 1: Structure Employee Controller { employees, pagination: { totalItems, totalPages, ... } }
  if (response.employees && response.pagination) {
    return {
      data: response.employees,
      total: response.pagination.totalItems || 0,
      totalPages: response.pagination.totalPages || Math.ceil((response.pagination.totalItems || 0) / (params.limit || 10))
    };
  }

  // Cas 2: Structure PayRun Service { data, pagination: { total, totalPages, ... } }
  if (response.data && response.pagination) {
    return {
      data: response.data,
      total: response.pagination.total || 0,
      totalPages: response.pagination.totalPages || Math.ceil((response.pagination.total || 0) / (params.limit || 10))
    };
  }

  // Cas 3: Structure Attendance/Payslip/Users { attendances/payslips/users, pagination: { total, totalPages, ... } }
  if (response.attendances && response.pagination) {
    return {
      data: response.attendances,
      total: response.pagination.total || 0,
      totalPages: response.pagination.totalPages || Math.ceil((response.pagination.total || 0) / (params.limit || 10))
    };
  }

  if (response.payslips && response.pagination) {
    return {
      data: response.payslips,
      total: response.pagination.total || 0,
      totalPages: response.pagination.totalPages || Math.ceil((response.pagination.total || 0) / (params.limit || 10))
    };
  }

  if (response.users && response.pagination) {
    return {
      data: response.users,
      total: response.pagination.totalItems || response.pagination.total || 0,
      totalPages: response.pagination.totalPages || Math.ceil((response.pagination.totalItems || response.pagination.total || 0) / (params.limit || 10))
    };
  }

  // Cas 4: Structure déjà normalisée { data, total, totalPages }
  if (response.data !== undefined && response.total !== undefined) {
    return {
      data: response.data || [],
      total: response.total || 0,
      totalPages: response.totalPages || Math.ceil((response.total || 0) / (params.limit || 10))
    };
  }

  // Cas 5: Structure simple avec juste les données (fallback)
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      totalPages: 1
    };
  }

  // Cas par défaut : structure vide
  console.warn('Structure de réponse non reconnue:', response);
  return {
    data: [],
    total: 0,
    totalPages: 0
  };
};

/**
 * Utilitaire pour loguer les structures de réponse pour debug
 */
export const logPaginationResponse = (response, source = 'API') => {
  console.log(`[${source}] Structure de réponse:`, {
    hasSuccess: !!response.success,
    hasMessage: !!response.message,
    hasWrapperData: !!(response.success && response.data),
    actualData: response.success ? response.data : response,
    hasEmployees: !!(response.employees || (response.data && response.data.employees)),
    hasData: !!(response.data && !response.success), // data direct, pas wrapper
    hasAttendances: !!(response.attendances || (response.data && response.data.attendances)),
    hasPayslips: !!(response.payslips || (response.data && response.data.payslips)),
    hasUsers: !!(response.users || (response.data && response.data.users)),
    hasPagination: !!(response.pagination || (response.data && response.data.pagination)),
    paginationKeys: response.pagination ? Object.keys(response.pagination) : 
                   (response.data && response.data.pagination) ? Object.keys(response.data.pagination) : [],
    fullResponse: response
  });
};