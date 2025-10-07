import React, { memo, useCallback, useMemo } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

export const FilterControls = memo(function FilterControls({
  pagination,
  searchConfig = {},
  selectFilters = [],
  customFilters = [],
  showActiveFilters = true,
  className = ''
}) {
  // Vérification et valeurs par défaut pour pagination
  if (!pagination) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Chargement des filtres...
      </div>
    );
  }

  // Vérification des propriétés requises
  if (typeof pagination !== 'object') {
    console.error('FilterControls: pagination prop is not an object:', pagination);
    return null;
  }

  const {
    filters = {},
    updateFilters = () => {},
    resetFilters = () => {},
    search = () => {}
  } = pagination;

  const {
    placeholder = "Rechercher...",
    searchField = "search",
    showSearchIcon = true
  } = searchConfig;

  // Compter les filtres actifs avec useMemo
  const activeFiltersInfo = useMemo(() => {
    const activeEntries = Object.entries(filters).filter(([key, value]) => 
      value !== null && value !== undefined && value !== ''
    );
    
    return {
      count: activeEntries.length,
      hasActive: activeEntries.length > 0,
      entries: activeEntries
    };
  }, [filters]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    search(value, searchField);
  }, [search, searchField]);

  const handleSelectChange = useCallback((filterKey, value) => {
    updateFilters({ [filterKey]: value === 'all' ? '' : value });
  }, [updateFilters]);

  const removeFilter = useCallback((filterKey) => {
    updateFilters({ [filterKey]: '' });
  }, [updateFilters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche et filtres principaux */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            {searchConfig && (
              <div className="relative flex-1">
                {showSearchIcon && (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                )}
                <Input
                  placeholder={placeholder}
                  value={filters[searchField] || ''}
                  onChange={handleSearchChange}
                  className={showSearchIcon ? "pl-10" : ""}
                />
              </div>
            )}

            {/* Filtres select */}
            {selectFilters.map((filter) => (
              <div key={filter.key} className="min-w-[150px]">
                <Select
                  value={filters[filter.key] || 'all'}
                  onValueChange={(value) => handleSelectChange(filter.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filter.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {filter.allLabel || `Tous les ${filter.label?.toLowerCase()}`}
                    </SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Filtres personnalisés */}
            {customFilters.map((CustomFilter, index) => (
              <div key={index}>
                <CustomFilter filters={filters} updateFilters={updateFilters} />
              </div>
            ))}

            {/* Bouton de réinitialisation */}
            {activeFiltersInfo.hasActive && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </Button>
            )}
          </div>

          {/* Indicateur de filtres */}
          {activeFiltersInfo.hasActive && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {activeFiltersInfo.count} filtre{activeFiltersInfo.count > 1 ? 's' : ''} actif{activeFiltersInfo.count > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtres actifs (badges) */}
      {showActiveFilters && activeFiltersInfo.hasActive && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '') return null;

            // Trouver le label pour les filtres select
            const selectFilter = selectFilters.find(f => f.key === key);
            const optionLabel = selectFilter?.options.find(opt => opt.value === value)?.label;
            const displayValue = optionLabel || value;
            const filterLabel = selectFilter?.label || key;

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                <span className="text-xs">
                  {filterLabel}: {displayValue}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(key)}
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default FilterControls;