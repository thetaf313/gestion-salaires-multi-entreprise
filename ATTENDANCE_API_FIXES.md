# Correction des API de pointages (AttendanceWithPagination)

## Problème identifié
L'erreur 404 `Cannot GET /api/company/cmgew66cs0000s6e9qnchtper/attendances` indiquait que la route utilisée côté frontend ne correspondait pas aux routes disponibles côté backend.

## Analyse des routes backend
Le backend utilise les routes suivantes pour les pointages :
- `GET /api/attendances` - Récupération des pointages avec pagination
- `POST /api/attendances/manual` - Création manuelle d'un pointage  
- `PATCH /api/attendances/:attendanceId` - Mise à jour d'un pointage
- `DELETE /api/attendances/:attendanceId` - Suppression d'un pointage
- `POST /api/attendances/create-with-auto-status` - Création avec statut automatique

Le backend utilise le `companyId` de l'utilisateur connecté automatiquement (via `req.user.companyId`), il n'est donc pas nécessaire de l'inclure dans l'URL.

## Corrections apportées

### 1. attendanceService.js - getAttendanceByCompany()
- **Avant:** `api.get(\`/company/\${companyId}/attendances\`, { params })`
- **Après:** `api.get(\`/attendances\`, { params })`

### 2. attendanceService.js - createAttendance()
- **Avant:** `api.post(\`/company/\${companyId}/attendances\`, data)`
- **Après:** `api.post(\`/attendances/manual\`, data)`

### 3. attendanceService.js - updateAttendance()
- **Avant:** `api.patch(\`/company/\${companyId}/attendances/\${attendanceId}\`, data)`
- **Après:** `api.patch(\`/attendances/\${attendanceId}\`, data)`

### 4. attendanceService.js - deleteAttendance()
- **Avant:** `api.delete(\`/company/\${companyId}/attendances/\${attendanceId}\`)`
- **Après:** `api.delete(\`/attendances/\${attendanceId}\`)`

## Structure de réponse backend
Le backend retourne la structure suivante pour la pagination :
```json
{
  "success": true,
  "message": "Pointages récupérés avec succès",
  "data": {
    "attendances": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

## Filtres supportés par le backend
- `employeeId` - ID de l'employé
- `startDate` - Date de début 
- `endDate` - Date de fin
- `status` - Statut du pointage (PRESENT, LATE, ABSENT, HALF_DAY, VACATION)
- `isValidated` - Pointage validé (true/false)
- `page` - Numéro de page
- `limit` - Nombre d'éléments par page

## Résultat attendu
✅ La page AttendanceWithPagination devrait maintenant charger les pointages correctement
✅ La pagination devrait fonctionner
✅ Les filtres par statut, mois et année devraient fonctionner
✅ Les actions CRUD sur les pointages devraient fonctionner