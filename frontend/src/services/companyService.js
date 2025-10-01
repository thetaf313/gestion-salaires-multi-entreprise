import api from "./api";

export const companyService = {
  async getAllCompanies() {
    const response = await api.get("/companies");
    return response.data;
  },

  async getCompanyById(companyId) {
    const response = await api.get(`/companies/${companyId}`);
    return response.data;
  },

  async createCompany(companyData) {
    const response = await api.post("/companies", companyData);
    return response.data;
  },

  async updateCompany(companyId, companyData) {
    const response = await api.put(`/companies/${companyId}`, companyData);
    return response.data;
  },

  async deleteCompany(companyId) {
    const response = await api.delete(`/companies/${companyId}`);
    return response.data;
  },

  async getCompanyStats(companyId) {
    const response = await api.get(`/companies/${companyId}/stats`);
    return response.data;
  },

  async getMyCompany() {
    const response = await api.get("/companies/me");
    return response.data;
  },

  async updateMyCompany(companyData) {
    const response = await api.put("/companies/me", companyData);
    return response.data;
  },

  async uploadLogo(logoFile) {
    const formData = new FormData();
    formData.append("logo", logoFile);

    const response = await api.post("/companies/me/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default companyService;
