import api from "./api";

const workScheduleService = {
  // Créer ou mettre à jour la configuration des horaires
  createOrUpdate: async (companyId, data) => {
    try {
      const response = await api.post(`/work-schedule/${companyId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la configuration des horaires",
      };
    }
  },

  // Obtenir la configuration des horaires
  get: async (companyId) => {
    try {
      const response = await api.get(`/work-schedule/${companyId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la récupération des horaires",
      };
    }
  },

  // Mettre à jour la configuration des horaires
  update: async (companyId, data) => {
    try {
      const response = await api.patch(`/work-schedule/${companyId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la mise à jour des horaires",
      };
    }
  },

  // Supprimer la configuration des horaires
  delete: async (companyId) => {
    try {
      const response = await api.delete(`/work-schedule/${companyId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la suppression des horaires",
      };
    }
  },

  // Vérifier si c'est l'heure de travail
  isWorkTime: async (companyId, datetime) => {
    try {
      const response = await api.post(
        `/work-schedule/${companyId}/check-work-time`,
        {
          datetime: datetime || new Date().toISOString(),
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la vérification de l'horaire",
      };
    }
  },

  // Obtenir les horaires de travail pour une date donnée
  getScheduleForDate: async (companyId, date) => {
    try {
      const response = await api.get(
        `/work-schedule/${companyId}/date/${date}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la récupération des horaires pour cette date",
      };
    }
  },
};

export default workScheduleService;
