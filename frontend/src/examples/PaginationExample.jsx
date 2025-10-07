// Exemple d'utilisation du système de pagination
// Fichier : frontend/src/examples/PaginationExample.jsx

import { useApiPagination } from "../hooks/useApiPagination";
import { FilterControls } from "../components/ui/FilterControls";
import { PaginationControls } from "../components/ui/PaginationControls";

export function PaginationExample() {
  // 1. Configuration de l'API
  const apiFunction = async (params) => {
    // Votre appel API ici
    const response = await fetch(`/api/data?${new URLSearchParams(params)}`);
    const result = await response.json();

    return {
      data: result.items,
      total: result.totalCount,
      totalPages: Math.ceil(result.totalCount / params.limit),
    };
  };

  // 2. Configuration du hook de pagination
  const pagination = useApiPagination({
    apiFunction,
    dependencies: [], // Re-fetch si ces valeurs changent
    defaultFilters: {
      search: "",
      status: "",
      category: "",
    },
    defaultLimit: 10,
    onError: (error) => {
      console.error("Erreur de chargement:", error);
    },
  });

  // 3. Configuration des filtres
  const filterConfig = {
    searchConfig: {
      placeholder: "Rechercher...",
      searchField: "search",
    },
    selectFilters: [
      {
        key: "status",
        label: "Statut",
        placeholder: "Choisir un statut",
        options: [
          { value: "active", label: "Actif" },
          { value: "inactive", label: "Inactif" },
        ],
        allLabel: "Tous les statuts",
      },
      {
        key: "category",
        label: "Catégorie",
        placeholder: "Choisir une catégorie",
        options: [
          { value: "A", label: "Catégorie A" },
          { value: "B", label: "Catégorie B" },
        ],
        allLabel: "Toutes les catégories",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <FilterControls pagination={pagination} {...filterConfig} />

      {/* Contenu paginé */}
      {pagination.loading ? (
        <div>Chargement...</div>
      ) : pagination.isEmpty ? (
        <div>Aucun résultat</div>
      ) : (
        <div>
          {pagination.data.map((item) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      )}

      {/* Contrôles de pagination */}
      <PaginationControls
        pagination={pagination}
        limitOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}

// Exemple d'utilisation avec Hook simple
export function SimplePaginationExample() {
  const [data, setData] = useState([]);

  // Hook simple pour données statiques
  const pagination = usePagination({
    data: data,
    defaultFilters: { search: "" },
    defaultLimit: 10,
    searchFields: ["name", "email"],
  });

  return (
    <div className="space-y-6">
      <FilterControls
        pagination={pagination}
        searchConfig={{
          placeholder: "Rechercher par nom ou email...",
          searchField: "search",
        }}
      />

      <div>
        {pagination.paginatedData.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      <PaginationControls pagination={pagination} limitOptions={[10, 20, 50]} />
    </div>
  );
}

// Guide d'utilisation en commentaires
/*
GUIDE D'UTILISATION DU SYSTÈME DE PAGINATION

1. HOOK useApiPagination - Pour données depuis API
   - apiFunction: Fonction qui appelle votre API
   - dependencies: Array des valeurs qui déclenchent un re-fetch
   - defaultFilters: Filtres par défaut
   - defaultLimit: Nombre d'éléments par page par défaut
   - onError: Callback en cas d'erreur

2. HOOK usePagination - Pour données statiques/locales
   - data: Array des données complètes
   - defaultFilters: Filtres par défaut
   - defaultLimit: Nombre d'éléments par page par défaut
   - searchFields: Champs dans lesquels rechercher

3. COMPOSANT FilterControls
   - pagination: Instance du hook de pagination
   - searchConfig: Configuration de la recherche
   - selectFilters: Array des filtres par sélection

4. COMPOSANT PaginationControls
   - pagination: Instance du hook de pagination
   - limitOptions: Options pour le nombre d'éléments par page

PROPRIÉTÉS DISPONIBLES sur l'objet pagination :
- data: Données courantes
- loading: État de chargement
- isEmpty: Aucun résultat
- totalItems: Nombre total d'éléments
- totalPages: Nombre total de pages
- currentPage: Page courante
- limit: Éléments par page
- filters: Filtres actifs
- setFilter(key, value): Modifier un filtre
- setPage(page): Aller à une page
- setLimit(limit): Modifier la limite
- goToFirstPage(): Première page
- goToPreviousPage(): Page précédente
- goToNextPage(): Page suivante
- goToLastPage(): Dernière page
- reload(): Recharger les données

EXEMPLE DE CONFIGURATION API :
Le service API doit accepter ces paramètres :
{
  page: 1,           // Numéro de page (1-based)
  limit: 10,         // Éléments par page
  search: "terme",   // Terme de recherche
  status: "active",  // Filtres personnalisés
  category: "A"
}

Et retourner :
{
  data: [...],       // Array des éléments
  total: 150,        // Total d'éléments
  totalPages: 15,    // Total de pages calculé
  currentPage: 1,    // Page courante
  limit: 10         // Limite par page
}

PERSISTANCE URL :
Les filtres et la pagination sont automatiquement persistés dans l'URL :
/ma-page?page=2&limit=20&search=john&status=active

RESPONSIVE DESIGN :
Tous les composants sont optimisés pour mobile avec :
- Navigation simplifiée
- Boutons adaptatifs
- Layout responsive
*/
