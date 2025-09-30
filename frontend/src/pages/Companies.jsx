import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../services/companyService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import CreateCompanyModal from "../components/CreateCompanyModal";
import {
  Building2,
  Plus,
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAllCompanies();
      if (response.success) {
        setCompanies(response.data.items || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = (newCompany) => {
    setCompanies((prev) => [newCompany, ...prev]);
    console.log("✅ Nouvelle entreprise créée:", newCompany);
  };

  const handleViewCompany = (company) => {
    console.log("👁️ Voir entreprise:", company);
    // Navigation vers la page admin de l'entreprise
    navigate(`/company/${company.id}/dashboard`);
  };

  const handleEditCompany = (company) => {
    console.log("✏️ Modifier entreprise:", company);
    // TODO: Ouvrir le modal d'édition
  };

  const handleDeleteCompany = async (company) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${company.name}" ?`)
    ) {
      try {
        await companyService.deleteCompany(company.id);
        setCompanies((prev) => prev.filter((c) => c.id !== company.id));
        console.log("🗑️ Entreprise supprimée:", company.name);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de l'entreprise");
      }
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Entreprises
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les entreprises de votre plateforme
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus size={16} className="mr-2" />
          Nouvelle Entreprise
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Entreprises
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">ce mois</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Entreprises Actives
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Employés
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce(
                  (total, company) => total + (company._count?.employees || 0),
                  0
                )}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card className="p-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Liste des entreprises */}
      {filteredCompanies.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune entreprise trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Aucun résultat pour votre recherche."
              : "Commencez par créer votre première entreprise."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Créer une entreprise
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {company.name}
                    </h3>
                    <Badge variant={company.isActive ? "default" : "secondary"}>
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewCompany(company)}
                    title="Voir les détails"
                  >
                    <ExternalLink size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCompany(company)}
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCompany(company)}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {company.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} />
                    <span className="truncate">{company.address}</span>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center space-x-2">
                    <Mail size={14} />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={14} />
                    <span>{company.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users size={14} />
                  <span>{company._count?.employees || 0} employés</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Créée le {new Date(company.createdAt).toLocaleDateString()}
                  </span>
                  <span>{company.payPeriodType}</span>
                </div>
              </div>

              {/* Bouton d'accès à l'entreprise */}
              <div className="mt-4">
                <Button
                  onClick={() => handleViewCompany(company)}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Accéder à l'entreprise
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de création d'entreprise */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </div>
  );
};

export default Companies;
