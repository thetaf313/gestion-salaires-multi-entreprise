import api from "./api";

export const employeeService = {
  // Créer un nouvel employé
  async createEmployee(employeeData, companyId = null) {
    // Si companyId est fourni, utiliser l'endpoint spécifique
    if (companyId) {
      const response = await api.post(
        `/employees/company/${companyId}`,
        employeeData
      );
      return response.data;
    }

    // Sinon, utiliser l'ancien endpoint (companyId doit être dans employeeData)
    const response = await api.post("/employees", employeeData);
    return response.data;
  },

  // Obtenir les employés d'une entreprise
  async getEmployeesByCompany(companyId, page = 1, limit = 10) {
    const response = await api.get(
      `/employees/company/${companyId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Alias pour getEmployeesByCompany (utilisé dans CreatePayRunModal)
  async getByCompany(companyId, page = 1, limit = 100) {
    const response = await api.get(
      `/employees/company/${companyId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Obtenir un employé par ID
  async getEmployeeById(employeeId) {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  // Mettre à jour un employé
  async updateEmployee(employeeId, updateData) {
    const response = await api.put(`/employees/${employeeId}`, updateData);
    return response.data;
  },

  // Supprimer un employé
  async deleteEmployee(employeeId) {
    const response = await api.delete(`/employees/${employeeId}`);
    return response.data;
  },

  // Obtenir les statistiques des employés d'une entreprise
  async getEmployeeStats(companyId) {
    const response = await api.get(`/employees/company/${companyId}/stats`);
    return response.data;
  },

  // Rechercher des employés
  async searchEmployees(companyId, query) {
    const response = await api.get(
      `/employees/company/${companyId}/search?query=${encodeURIComponent(
        query
      )}`
    );
    return response.data;
  },
};

export default employeeService;
