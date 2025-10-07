/**
 * Utilitaires pour le formatage des dates
 */

/**
 * Formate une date en toute sécurité
 * @param {string|Date|null|undefined} dateValue - La valeur de date à formater
 * @param {string} locale - La locale à utiliser (par défaut 'fr-FR')
 * @param {object} options - Options de formatage
 * @returns {string} Date formatée ou 'Date invalide'
 */
export const formatDate = (dateValue, locale = 'fr-FR', options = {}) => {
  if (!dateValue) {
    return 'Date non définie';
  }

  try {
    const date = new Date(dateValue);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date invalide';
  }
};

/**
 * Formate une période (date de début - date de fin)
 * @param {string|Date} startDate - Date de début
 * @param {string|Date} endDate - Date de fin
 * @param {string} locale - La locale à utiliser (par défaut 'fr-FR')
 * @returns {string} Période formatée
 */
export const formatPeriod = (startDate, endDate, locale = 'fr-FR') => {
  const formattedStart = formatDate(startDate, locale);
  const formattedEnd = formatDate(endDate, locale);
  
  if (formattedStart === 'Date invalide' || formattedEnd === 'Date invalide') {
    return 'Période invalide';
  }
  
  return `${formattedStart} - ${formattedEnd}`;
};

/**
 * Formate une heure en toute sécurité
 * @param {string|Date|null|undefined} timeValue - La valeur de temps à formater
 * @param {string} locale - La locale à utiliser (par défaut 'fr-FR')
 * @returns {string} Heure formatée ou 'Heure invalide'
 */
export const formatTime = (timeValue, locale = 'fr-FR') => {
  if (!timeValue) {
    return 'Non définie';
  }

  try {
    let date;
    
    // Si c'est juste une heure (HH:mm), créer une date complète
    if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
      date = new Date(`2000-01-01T${timeValue}:00`);
    } else {
      date = new Date(timeValue);
    }
    
    if (isNaN(date.getTime())) {
      return 'Heure invalide';
    }

    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de l\'heure:', error);
    return 'Heure invalide';
  }
};

/**
 * Vérifie si une date est valide
 * @param {any} dateValue - La valeur à vérifier
 * @returns {boolean} True si la date est valide
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  
  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};