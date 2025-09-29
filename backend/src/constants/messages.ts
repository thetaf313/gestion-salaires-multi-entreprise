// Centralised application messages (French)
// Grouped by domain. Names are explicit and stable keys; values remain human-readable in FR.
export const Messages = {
  // Auth
  AUTH_LOGIN_SUCCESS: "Connexion réussie",
  AUTH_REGISTER_SUCCESS: "Inscription réussie",
  AUTH_LOGIN_FAILED: "Échec de l'authentification",
  AUTH_REGISTER_FAILED: "Échec de l'inscription",
  AUTH_REFRESH_TOKEN_MISSING: "Refresh token manquant",
  AUTH_REFRESH_SUCCESS: "Token rafraîchi avec succès",
  AUTH_REFRESH_FAILED: "Impossible de rafraîchir le token",
  AUTH_LOGOUT_SUCCESS: "Déconnexion réussie",
  LOGIN_PASSWORD_INCORECT:"Login ou mot de passe incorrect",
  USER_ALREADY_EXISTS: "Un utilisateur avec cet email existe déjà",
  AUTH_PROFILE_FAILED: "Échec de la récupération du profil utilisateur",
  AUTH_PROFILE_NOT_FOUND: "Profil utilisateur non trouvé",
  AUTH_PROFILE_SUCCESS: "Profil utilisateur récupéré avec succès",



  // RBAC / Middleware
  TOKEN_REQUIRED: "Token d'accès requis",
  REFRESH_TOKEN_INVALID:"Refresh token invalide",
  TOKEN_INVALID_OR_EXPIRED: "Token invalide ou expiré",
  USER_NOT_AUTHENTICATED_OR_PROFILE_MISSING: "Utilisateur non authentifié ou profil manquant",
  USER_PROFILE_INVALID: (p: string) => `Profil utilisateur '${p}' non valide`,
  RESOURCE_NOT_CONFIGURED: (r: string, m: string) => `Ressource '${r}' avec méthode '${m}' non configurée`,
  ACCESS_FORBIDDEN_FOR_PROFILE: (profile: string, method: string, resource: string) => `Accès refusé: profil '${profile}' non autorisé pour '${method} /${resource}'`,

  // Generic
  ID_INVALID: "ID invalide",
  VALIDATION_ERROR: "Erreur de validation",
  PRISMA_ERROR: "Erreur Prisma",
  NOT_FOUND: "Ressource non trouvée",
  INTERNAL_SERVER_ERROR: "Erreur interne du serveur",

  // Domain: Competence
  COMPETENCE_NOT_FOUND: "Compétence non trouvée",
  COMPETENCE_DELETED: "Compétence supprimée",

  // Domain: Tag
  TAG_NOT_FOUND: "Tag non trouvé",
  TAG_DELETED: "Tag supprimé",

  // Domain: Profil
  PROFIL_NOT_FOUND: "Profil non trouvé",
  PROFIL_CREATED_ERROR: "Erreur lors de la création du profil",
  PROFIL_FETCH_ERROR: "Erreur lors de la récupération des profils",
  PROFIL_UPDATE_ERROR: "Erreur lors de la mise à jour du profil",
  PROFIL_DELETE_ERROR: "Erreur lors de la suppression du profil",
  NAME_REQUIRED: "Le nom est requis",

  // Domain: Niveau
  NIVEAU_FETCH_ERROR: "Erreur lors de la récupération des niveaux",
  NIVEAU_FETCH_ONE_ERROR: "Erreur lors de la récupération du niveau",
  NIVEAU_CREATE_ERROR: "Erreur lors de la création du niveau",
  NIVEAU_UPDATE_ERROR: "Erreur lors de la mise à jour du niveau",
  NIVEAU_DELETE_ERROR: "Erreur lors de la suppression du niveau",
  LABEL_REQUIRED: "Le libellé est requis",
  NIVEAU_NOT_FOUND: 'Niveau non trouvé',

  // Domain: Promotion
  PROMOTION_NOT_FOUND: "Promotion non trouvée",
  PROMOTION_CREATED_SUCCESS: "Promotion créée avec succès",
  PROMOTION_UPDATED_SUCCESS: "Promotion mise à jour avec succès",

  // Domain: Referentiel
  REFERENTIEL_NOT_FOUND: "Référentiel non trouvé",
  REFERENTIEL_CREATED_SUCCESS: "Référentiel créé avec succès",
  REFERENTIEL_UPDATED_SUCCESS: "Référentiel mis à jour avec succès",
  REFERENTIEL_COMPETENCES_NOT_FOUND: "Compétences non trouvées pour ce référentiel",

  // Domain: ProfilSortie
  PROFIL_SORTIE_CREATED_SUCCESS: "Profile créée avec succès",
  PROFIL_SORTIE_UPDATED_SUCCESS: "Profile mise à jour avec succès",
  PROFILE_NOT_FOUND_FEM: "Profile non trouvée",

  // Users
  USER_NOT_FOUND: "Utilisateur non trouvé",
  USER_ID_INVALID:"ID invalide",
  USER_EMAIL_EXISTS: "Un utilisateur avec cet email existe déjà",
  USER_EMAIL_ALREADY_USED: "Cet email est déjà utilisé",
  USER_CREATED_SUCCESS: "Utilisateur créé avec succès",
  USER_UPDATED_SUCCESS: "Utilisateur mis à jour avec succès",
  USER_TOGGLED_SUCCESS: (status: string) => `Utilisateur ${status === "Actif" ? "activé" : "désactivé"} avec succès`,
} as const;

export type MessageKey = keyof typeof Messages;