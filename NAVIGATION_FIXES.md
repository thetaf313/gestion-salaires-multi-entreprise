# Corrections des liens de navigation - Boutons "Retour"

## Problème identifié
Les boutons "retour" dans plusieurs pages menaient vers des pages vides à cause de:
1. Utilisation de `navigate(-1)` qui peut parfois conduire vers des pages non désirées
2. Liens vers des routes inexistantes (`/dashboard/companies/...` au lieu de `/company/...`)

## Corrections effectuées

### 1. CompanyEmployeesWithPagination.jsx
- **Avant:** `navigate(\`/dashboard/companies/${companyId}\`)`
- **Après:** `navigate(\`/company/${companyId}/dashboard\`)`
- **Avant:** `navigate(\`/dashboard/companies/${companyId}/employees/${employee.id}\`)`
- **Après:** `navigate(\`/company/${companyId}/employees/${employee.id}\`)`

### 2. PayrollCyclesWithPagination.jsx
- **Avant:** `navigate(\`/dashboard/companies/${companyId}\`)`
- **Après:** `navigate(\`/company/${companyId}/dashboard\`)`
- **Avant:** `navigate(\`/dashboard/companies/${companyId}/payroll/${payrun.id}\`)`
- **Après:** `navigate(\`/company/${companyId}/payroll/${payrun.id}/payslips\`)`

### 3. AttendanceWithPagination.jsx
- **Avant:** `navigate(\`/dashboard/companies/${companyId}\`)`
- **Après:** `navigate(\`/company/${companyId}/dashboard\`)`

### 4. PayslipsWithPagination.jsx
- **Avant:** `navigate(\`/dashboard/companies/${companyId}/payroll/${payrunId}\`)` et `navigate(\`/dashboard/companies/${companyId}/payroll\`)`
- **Après:** `navigate(\`/company/${companyId}/payroll-cycles\`)` et `navigate(\`/company/${companyId}/dashboard\`)`
- **Avant:** `navigate(\`/dashboard/companies/${companyId}/payslips/${payslip.id}\`)`
- **Après:** `handleDownloadPayslip(payslip)` (télécharge directement le bulletin car pas de page de détails)

### 5. CompanyUsersWithPagination.jsx
- **Avant:** `navigate(\`/dashboard/companies/${companyId}\`)`
- **Après:** `navigate(\`/company/${companyId}/dashboard\`)`

### 6. EmployeeDetails.jsx
- **Avant:** `navigate(-1)` (3 occurrences)
- **Après:** `navigate(\`/company/${companyId}/employees\`)` (navigation explicite vers la liste des employés)

## Routes valides dans l'application

### Routes principales:
- `/dashboard` - Dashboard principal
- `/companies` - Liste des entreprises (SUPER_ADMIN)
- `/company/:companyId/dashboard` - Dashboard d'une entreprise
- `/company/:companyId/users` - Gestion des utilisateurs
- `/company/:companyId/employees` - Gestion des employés
- `/company/:companyId/employees/:employeeId` - Détails d'un employé
- `/company/:companyId/employees/create` - Création d'employé
- `/company/:companyId/payroll-cycles` - Cycles de paie
- `/company/:companyId/payslips` - Bulletins de paie
- `/company/:companyId/payroll/:payrunId/payslips` - Bulletins d'un cycle spécifique
- `/company/:companyId/attendance` - Pointage

## Résultat
✅ Tous les boutons "retour" naviguent maintenant vers des pages valides
✅ Fini les pages vides lors du clic sur "retour"
✅ Navigation cohérente dans toute l'application
✅ Routes correctement alignées avec la structure définie dans App.jsx

## Test recommandé
1. Tester la navigation depuis chaque page avec pagination
2. Vérifier que les boutons "retour" mènent vers la bonne page parente
3. Confirmer que les liens "voir détails" fonctionnent correctement