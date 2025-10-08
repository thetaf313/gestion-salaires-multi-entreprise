import api from "./api.js";

export const payslipService = {
  // Obtenir les bulletins de paie d'une entreprise
  async getByCompany(companyId, params = {}) {
    const { page = 1, limit = 10, status = "all", payRunId } = params;
    const response = await api.get(`/company/${companyId}/payslips`, {
      params: { page, limit, status, payRunId },
    });
    return response.data;
  },

  // Obtenir un bulletin de paie par ID
  async getById(companyId, id) {
    const response = await api.get(`/company/${companyId}/payslips/${id}`);
    return response.data;
  },

  // Mettre à jour le statut d'un bulletin
  async updateStatus(companyId, id, status) {
    const response = await api.patch(
      `/company/${companyId}/payslips/${id}/status`,
      { status }
    );
    return response.data;
  },

  // Obtenir les statistiques des bulletins
  async getStats(companyId) {
    const response = await api.get(`/company/${companyId}/payslips/stats`);
    return response.data;
  },

  // Méthodes supplémentaires pour la pagination
  async getPayslipsByCompany(companyId, params = {}) {
    return await this.getByCompany(companyId, params);
  },

  async getPayslipsByPayrun(companyId, payrunId, params = {}) {
    const paramsWithPayrun = { ...params, payRunId: payrunId };
    return await this.getByCompany(companyId, paramsWithPayrun);
  },

  async downloadPayslip(companyId, payslipId) {
    // Return the full axios response so callers can inspect headers or data
    const response = await api.get(`/company/${companyId}/payslips/${payslipId}/download`, {
      responseType: 'blob',
    });
    return response; // response.data will be the blob
  },

  async deletePayslip(companyId, payslipId) {
    const response = await api.delete(`/company/${companyId}/payslips/${payslipId}`);
    return response.data;
  },
};
