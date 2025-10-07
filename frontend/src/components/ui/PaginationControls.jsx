import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal 
} from 'lucide-react';

export function PaginationControls({
  pagination,
  showLimitSelector = true,
  limitOptions = [5, 10, 20, 50, 100],
  showInfo = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  size = 'default',
  className = ''
}) {
  const {
    page,
    limit,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changeLimit,
    getPageNumbers
  } = pagination;

  if (totalItems === 0) {
    return (
      <div className={`flex items-center justify-center py-4 text-sm text-muted-foreground ${className}`}>
        Aucun élément à afficher
      </div>
    );
  }

  const pageNumbers = getPageNumbers(maxVisiblePages);
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Informations de pagination */}
      {showInfo && (
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Affichage de {startIndex} à {endIndex} sur {totalItems} éléments
          </p>
          
          {showLimitSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Afficher:</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => changeLimit(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Contrôles de navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Première page */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={goToFirstPage}
            disabled={isFirstPage}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Page précédente */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Précédent</span>
          </Button>

          {/* Numéros de page */}
          {showPageNumbers && (
            <div className="flex items-center gap-1">
              {/* Ellipsis au début */}
              {pageNumbers[0] > 1 && (
                <>
                  <Button
                    variant={1 === page ? "default" : "outline"}
                    size={buttonSize}
                    onClick={() => goToPage(1)}
                    className="hidden sm:flex"
                  >
                    1
                  </Button>
                  {pageNumbers[0] > 2 && (
                    <div className="hidden sm:flex items-center">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  )}
                </>
              )}

              {/* Numéros de page visibles */}
              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size={buttonSize}
                  onClick={() => goToPage(pageNum)}
                  className="hidden sm:flex"
                >
                  {pageNum}
                </Button>
              ))}

              {/* Ellipsis à la fin */}
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <div className="hidden sm:flex items-center">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  )}
                  <Button
                    variant={totalPages === page ? "default" : "outline"}
                    size={buttonSize}
                    onClick={() => goToPage(totalPages)}
                    className="hidden sm:flex"
                  >
                    {totalPages}
                  </Button>
                </>
              )}

              {/* Indicateur de page mobile */}
              <div className="sm:hidden flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} sur {totalPages}
                </span>
              </div>
            </div>
          )}

          {/* Page suivante */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={goToNextPage}
            disabled={!hasNextPage}
          >
            <span className="hidden sm:inline mr-1">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dernière page */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={goToLastPage}
            disabled={isLastPage}
            className="hidden sm:flex"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default PaginationControls;