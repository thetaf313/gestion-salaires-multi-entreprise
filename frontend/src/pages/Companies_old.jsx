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
  FileText,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp
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
    setCompanies(prev => [newCompany, ...prev]);
    console.log("✅ Nouvelle entreprise créée:", newCompany);
  };

  const handleViewCompany = (company) => {
    // Pour le super admin, voir les détails de l'entreprise
    // TODO: Naviguer vers la page de détails de l'entreprise
    console.log("👁️ Voir entreprise:", company);
    navigate(`/company/${company.id}/dashboard`);
  };

  const handleEditCompany = (company) => {
    // TODO: Ouvrir le modal d'édition
    console.log("✏️ Modifier entreprise:", company);
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${company.name}" ?`)) {
      try {
        await companyService.deleteCompany(company.id);
        setCompanies(prev => prev.filter(c => c.id !== company.id));
        console.log("🗑️ Entreprise supprimée:", company.name);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de l'entreprise");
      }
    }
  };
    try {
      setLoading(true);
      const response = await companyService.getAllCompanies({
        search: searchTerm,
        page: 1,
        pageSize: 20,
      });

      if (response.success) {
        setCompanies(response.data.items || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCompanies();
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const response = await companyService.createCompany(formData);

      if (response.success) {
        setIsCreateDialogOpen(false);
        setFormData({
          name: "",
          address: "",
          phone: "",
          email: "",
          currency: "XOF",
          payPeriodType: "MONTHLY",
        });
        loadCompanies(); // Recharger la liste
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      } else {
        setFormErrors({
          general: "Erreur lors de la création de l'entreprise",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Nettoyer l'erreur du champ si elle existe
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getPayPeriodLabel = (type) => {
    const labels = {
      MONTHLY: "Mensuel",
      WEEKLY: "Hebdomadaire",
      DAILY: "Quotidien",
    };
    return labels[type] || type;
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
            Gérez toutes les entreprises de la plateforme
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Entreprise
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle entreprise</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{formErrors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nom de l'entreprise *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: TechCorp SARL"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Adresse complète de l'entreprise"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@entreprise.com"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="XOF">XOF (CFA)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="payPeriodType">Période de paie</Label>
                  <select
                    id="payPeriodType"
                    value={formData.payPeriodType}
                    onChange={(e) =>
                      handleInputChange("payPeriodType", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="MONTHLY">Mensuel</option>
                    <option value="WEEKLY">Hebdomadaire</option>
                    <option value="DAILY">Quotidien</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Rechercher
          </Button>
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter((c) => c.isActive).length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactives</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter((c) => !c.isActive).length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card
            key={company.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="space-y-4">
              {/* En-tête de la carte */}
              <div className="flex items-start justify-between">
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
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-2">
                {company.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{company.address}</span>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>

              {/* Statistiques */}
              <div className="flex justify-between pt-3 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {company._count?.employees || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Employés</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {company._count?.payRuns || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Paies</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {company.currency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Devise</p>
                </div>
              </div>

              {/* Période de paie */}
              <div className="pt-2">
                <Badge variant="outline" className="text-xs">
                  {getPayPeriodLabel(company.payPeriodType)}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Message si aucune entreprise */}
      {filteredCompanies.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune entreprise trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Aucune entreprise ne correspond à votre recherche."
              : "Commencez par créer votre première entreprise."}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une entreprise
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Companies;
