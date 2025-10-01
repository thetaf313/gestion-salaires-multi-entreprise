import api from './api.js';

export const paymentService = {
  // Créer un nouveau paiement
  async create(companyId, data) {
    const response = await api.post(`/company/${companyId}/payments`, data);
    return response.data;
  },

  // Obtenir les paiements d'une entreprise
  async getByCompany(companyId, params = {}) {
    const { page = 1, limit = 10, method = 'all', payRunId } = params;
    const response = await api.get(`/company/${companyId}/payments`, {
      params: { page, limit, method, payRunId }
    });
    return response.data;
  },

  // Obtenir un paiement par ID
  async getById(companyId, id) {
    const response = await api.get(`/company/${companyId}/payments/${id}`);
    return response.data;
  },

  // Obtenir les statistiques des paiements
  async getStats(companyId) {
    const response = await api.get(`/company/${companyId}/payments/stats`);
    return response.data;
  },

  // Obtenir les paiements par bulletin de paie
  async getByPayslip(companyId, payslipId) {
    const response = await api.get(`/company/${companyId}/payslips/${payslipId}/payments`);
    return response.data;
  }
};