export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: "all" | "active" | "inactive";
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    todos: T[];
    pagination: PaginationInfo;
  };
}

export class PaginationHelper {
  static calculatePagination(
    page: number,
    pageSize: number,
    total: number
  ): PaginationInfo {
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, total);

    return {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startIndex: total > 0 ? startIndex : 0,
      endIndex: total > 0 ? endIndex : 0,
    };
  }

  static validatePaginationParams(queryParams: {
    page?: string | number;
    pageSize?: string | number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }): PaginationParams {
    const defaultPageSize = 10;
    const maxPageSize = 100;
    const validSortFields = ["createdAt", "updatedAt", "title", "isActive"];
    const validSortOrders = ["asc", "desc"];
    const validStatuses = ["all", "active", "inactive"];

    let validPage = 1;
    let validPageSize = defaultPageSize;

    // Validation page
    if (queryParams.page) {
      const parsedPage =
        typeof queryParams.page === "string"
          ? parseInt(queryParams.page, 10)
          : queryParams.page;
      if (parsedPage > 0) {
        validPage = parsedPage;
      }
    }

    // Validation pageSize
    if (queryParams.pageSize) {
      const parsedPageSize =
        typeof queryParams.pageSize === "string"
          ? parseInt(queryParams.pageSize, 10)
          : queryParams.pageSize;
      if (parsedPageSize > 0 && parsedPageSize <= maxPageSize) {
        validPageSize = parsedPageSize;
      }
    }

    // Validation sortBy
    let validSortBy = "createdAt"; // Par défaut
    if (queryParams.sortBy && validSortFields.includes(queryParams.sortBy)) {
      validSortBy = queryParams.sortBy;
    }

    // Validation sortOrder
    let validSortOrder: "asc" | "desc" = "desc"; // Par défaut
    if (
      queryParams.sortOrder &&
      validSortOrders.includes(queryParams.sortOrder)
    ) {
      validSortOrder = queryParams.sortOrder as "asc" | "desc";
    }

    // Validation search
    const validSearch = queryParams.search?.trim() || "";

    // Validation status
    let validStatus: "all" | "active" | "inactive" = "all"; // Par défaut
    if (queryParams.status && validStatuses.includes(queryParams.status)) {
      validStatus = queryParams.status as "all" | "active" | "inactive";
    }

    return {
      page: validPage,
      pageSize: validPageSize,
      sortBy: validSortBy,
      sortOrder: validSortOrder,
      search: validSearch,
      status: validStatus,
    };
  }
}