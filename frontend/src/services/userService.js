import api from "./api";

class UserService {
  // Rechercher un employé pour créer un compte utilisateur
  async searchEmployeeForUser(companyId, searchTerm) {
    try {
      const response = await api.get(`/employee-users/search`, {
        params: { searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la recherche d'employé:", error);
      throw error;
    }
  }

  // Créer un compte utilisateur pour un employé
  async createUserForEmployee(employeeId, userData) {
    try {
      const response = await api.post(
        `/employee-users/${employeeId}/create-user`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du compte utilisateur:", error);
      throw error;
    }
  }

  // Obtenir les employés sans compte utilisateur
  async getEmployeesWithoutUser(companyId) {
    try {
      const response = await api.get(`/employee-users/without-user`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des employés sans compte:",
        error
      );
      throw error;
    }
  }

  // Obtenir tous les utilisateurs de l'entreprise
  async getCompanyUsers(companyId) {
    try {
      const response = await api.get(`/users/company/${companyId}`);
      return {
        success: true,
        data: response.data.data.users, // Extraire les utilisateurs de la réponse
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Erreur lors de la récupération des utilisateurs",
      };
    }
  }

  // Obtenir les utilisateurs de l'entreprise avec pagination et filtres
  async getCompanyUsersPaginated(companyId, params = {}) {
    try {
      const { page = 1, limit = 10, ...otherParams } = params;
      
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(otherParams).filter(([key, value]) => 
            value !== null && value !== undefined && value !== ''
          )
        )
      });

      const response = await api.get(`/users/company/${companyId}?${queryParams.toString()}`);
      return response.data; // Retourne directement la réponse avec wrapper
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  }

  // Désactiver un utilisateur
  async deactivateUser(userId) {
    try {
      const response = await api.patch(`/users/${userId}/deactivate`);
      return { success: true, message: "Utilisateur désactivé avec succès" };
    } catch (error) {
      console.error("Erreur lors de la désactivation de l'utilisateur:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Erreur lors de la désactivation",
      };
    }
  }

  // Réactiver un utilisateur
  async activateUser(userId) {
    try {
      const response = await api.patch(`/users/${userId}/activate`);
      return { success: true, message: "Utilisateur réactivé avec succès" };
    } catch (error) {
      console.error("Erreur lors de la réactivation de l'utilisateur:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Erreur lors de la réactivation",
      };
    }
  }

  // Réinitialiser le mot de passe d'un utilisateur
  async resetUserPassword(userId) {
    try {
      const response = await api.patch(`/users/${userId}/reset-password`);
      return {
        success: true,
        message: "Mot de passe réinitialisé avec succès",
        newPassword: response.data.data.newPassword,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Erreur lors de la réinitialisation",
      };
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(userData) {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la mise à jour du profil"
      );
    }
  }
}

export default new UserService();
