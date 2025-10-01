import api from "./api.js";

export const payRunService = {
  // Créer un nouveau cycle de paie
  async create(companyId, data) {
    const response = await api.post(`/company/${companyId}/payruns`, data);
    return response.data;
  },

  // Obtenir les cycles de paie d'une entreprise
  async getByCompany(companyId, params = {}) {
    const { page = 1, limit = 10, status = "all" } = params;
    const response = await api.get(`/company/${companyId}/payruns`, {
      params: { page, limit, status },
    });
    return response.data;
  },

  // Obtenir un cycle de paie par ID
  async getById(companyId, id) {
    const response = await api.get(`/company/${companyId}/payruns/${id}`);
    return response.data;
  },

  // Mettre à jour un cycle de paie
  async update(companyId, id, data) {
    const response = await api.put(`/company/${companyId}/payruns/${id}`, data);
    return response.data;
  },

  // Supprimer un cycle de paie
  async delete(companyId, id) {
    const response = await api.delete(`/company/${companyId}/payruns/${id}`);
    return response.data;
  },

  // Approuver un cycle de paie et générer les bulletins
  async approve(companyId, id) {
    const response = await api.patch(
      `/company/${companyId}/payruns/${id}/approve`
    );
    return response.data;
  },

  // Mettre à jour le statut d'un cycle de paie
  async updateStatus(id, status) {
    const response = await api.patch(`/payruns/${id}/status`, { status });
    return response.data;
  },

  // Obtenir les statistiques des cycles de paie
  async getStats(companyId) {
    const response = await api.get(`/company/${companyId}/payruns/stats`);
    return response.data;
  },
};
