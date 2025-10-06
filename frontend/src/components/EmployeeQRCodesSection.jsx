import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { QrCode, Download, Search, Grid, List } from "lucide-react";
import EmployeeQRGenerator from "./EmployeeQRGenerator";
import { employeeService } from "../services/employeeService";

const EmployeeQRCodesSection = ({ companyId }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  // Récupérer les employés
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getByCompany(companyId);
      console.log("Response from employeeService:", response); // Debug

      if (response.success && Array.isArray(response.data)) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } else {
        console.error("La réponse ne contient pas un tableau:", response);
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error("Erreur récupération employés:", error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les employés
  useEffect(() => {
    if (searchTerm && Array.isArray(employees)) {
      const filtered = employees.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employeeCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(Array.isArray(employees) ? employees : []);
    }
  }, [searchTerm, employees]);

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  // Télécharger tous les QR codes en ZIP
  const downloadAllQRCodes = () => {
    // Cette fonctionnalité nécessiterait une librairie comme JSZip
    // Pour l'instant, on affiche un message
    alert(
      "Fonctionnalité en développement: Téléchargement en lot des QR codes"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Chargement des employés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            QR Codes des Employés
          </h2>
          <p className="text-gray-600">
            Générez et téléchargez les QR codes pour le pointage des employés
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            variant="outline"
            size="sm"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
          </Button>
          <Button onClick={downloadAllQRCodes} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Télécharger Tout
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Employés
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(employees) ? employees.length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Affichés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(filteredEmployees)
                    ? filteredEmployees.length
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  QR Disponibles
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(filteredEmployees)
                    ? filteredEmployees.length
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grille des QR codes */}
      {!Array.isArray(filteredEmployees) || filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm
                ? "Aucun employé trouvé pour cette recherche"
                : "Aucun employé trouvé"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredEmployees.map((employee) =>
            viewMode === "grid" ? (
              <EmployeeQRGenerator key={employee.id} employee={employee} />
            ) : (
              <Card key={employee.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {employee.employeeCode}
                      </p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* Information sur l'utilisation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <QrCode className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">
                Comment utiliser les QR codes
              </h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Téléchargez et imprimez les QR codes des employés</li>
                <li>• Distribuez-les aux employés (badge, carte, etc.)</li>
                <li>
                  • Utilisez le scanner QR dans "Nouveau Pointage Intelligent"
                </li>
                <li>• Le code employé sera automatiquement rempli</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeQRCodesSection;
