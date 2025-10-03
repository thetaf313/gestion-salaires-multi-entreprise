import api from "./api";

const attendanceService = {
  // Rechercher un employé par code ou email
  searchEmployee: async (searchTerm) => {
    try {
      const response = await api.get(`/attendances/search-employee`, {
        params: { searchTerm },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la recherche de l'employé",
      };
    }
  },

  // Créer un pointage avec calcul automatique du statut
  createWithAutoStatus: async (data) => {
    try {
      const response = await api.post(
        `/attendances/create-with-auto-status`,
        data
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la création du pointage",
      };
    }
  },

  // Lister les pointages avec filtres
  getAttendances: async (params = {}) => {
    try {
      const response = await api.get(`/attendances`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la récupération des pointages",
      };
    }
  },

  // Créer un pointage manuel
  createManual: async (data) => {
    try {
      const response = await api.post(`/attendances/manual`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la création du pointage manuel",
      };
    }
  },

  // Mettre à jour un pointage
  update: async (attendanceId, data) => {
    try {
      const response = await api.patch(`/attendances/${attendanceId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la mise à jour du pointage",
      };
    }
  },

  // Supprimer un pointage
  delete: async (attendanceId) => {
    try {
      const response = await api.delete(`/attendances/${attendanceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la suppression du pointage",
      };
    }
  },
};

export default attendanceService;
