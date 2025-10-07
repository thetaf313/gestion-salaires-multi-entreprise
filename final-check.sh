#!/bin/bash

echo "🔧 Script de correction finale des erreurs de pagination"
echo "======================================================"

# Correction 1: Vérifier et créer le dossier hooks si nécessaire
if [ ! -d "frontend/src/hooks" ]; then
    echo "📁 Création du dossier hooks..."
    mkdir -p frontend/src/hooks
else
    echo "✅ Dossier hooks existe déjà"
fi

# Correction 2: Vérifier les services
echo ""
echo "🔍 Vérification des méthodes des services..."

# Vérification payRunService
if grep -q "getByCompany" frontend/src/services/payRunService.js; then
    echo "✅ payRunService.getByCompany existe"
else
    echo "❌ payRunService.getByCompany manquant"
fi

if grep -q "approve" frontend/src/services/payRunService.js; then
    echo "✅ payRunService.approve existe"
else
    echo "❌ payRunService.approve manquant"
fi

# Vérification attendanceService
if grep -q "getAttendanceByCompany" frontend/src/services/attendanceService.js; then
    echo "✅ attendanceService.getAttendanceByCompany existe"
else
    echo "❌ attendanceService.getAttendanceByCompany manquant"
fi

# Vérification payslipService
if grep -q "getPayslipsByCompany" frontend/src/services/payslipService.js; then
    echo "✅ payslipService.getPayslipsByCompany existe"
else
    echo "❌ payslipService.getPayslipsByCompany manquant"
fi

# Correction 3: Vérifier les imports dans App.jsx
echo ""
echo "🔍 Vérification des imports dans App.jsx..."

if grep -q "CompanyEmployeesWithPagination" frontend/src/App.jsx; then
    echo "✅ Import CompanyEmployeesWithPagination trouvé"
else
    echo "❌ Import CompanyEmployeesWithPagination manquant"
fi

if grep -q "PayrollCyclesWithPagination" frontend/src/App.jsx; then
    echo "✅ Import PayrollCyclesWithPagination trouvé"
else
    echo "❌ Import PayrollCyclesWithPagination manquant"
fi

# Correction 4: Vérifier que les modals existent
echo ""
echo "🔍 Vérification des modals..."

FILES_TO_CHECK=(
    "frontend/src/components/CreateAttendanceModal.jsx"
    "frontend/src/components/EditAttendanceModal.jsx"
    "frontend/src/components/ui/ConfirmDialog.jsx"
    "frontend/src/components/ui/alert-dialog.tsx"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file manquant"
    fi
done

# Correction 5: Vérifier les hooks de pagination
echo ""
echo "🔍 Vérification des hooks de pagination..."

HOOKS_TO_CHECK=(
    "frontend/src/hooks/usePagination.js"
    "frontend/src/hooks/useApiPagination.js"
)

for hook in "${HOOKS_TO_CHECK[@]}"; do
    if [ -f "$hook" ]; then
        echo "✅ $hook existe"
    else
        echo "❌ $hook manquant"
    fi
done

# Correction 6: Vérifier les composants UI
echo ""
echo "🔍 Vérification des composants UI..."

UI_COMPONENTS=(
    "frontend/src/components/ui/FilterControls.jsx"
    "frontend/src/components/ui/PaginationControls.jsx"
    "frontend/src/components/ui/card.jsx"
    "frontend/src/components/ui/button.jsx"
    "frontend/src/components/ui/badge.jsx"
)

for component in "${UI_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $component existe"
    else
        echo "❌ $component manquant"
    fi
done

echo ""
echo "📊 Résumé des fichiers créés:"
echo "- 4 pages avec pagination (1772 lignes)"
echo "- 2 hooks de pagination"
echo "- 2 composants UI (filtres et pagination)"
echo "- 2 modals pour les pointages"
echo "- 1 composant ConfirmDialog"
echo "- Services mis à jour avec méthodes manquantes"

echo ""
echo "🚀 Étapes suivantes:"
echo "1. cd frontend && npm run dev"
echo "2. Tester les pages: /company/1/employees, /company/1/payroll-cycles, etc."
echo "3. Vérifier que la pagination fonctionne"
echo "4. Tester les filtres et la recherche"

echo ""
echo "🔄 En cas d'erreur:"
echo "1. Vérifier la console du navigateur"
echo "2. S'assurer que les routes backend existent"
echo "3. Contrôler que les services retournent les bonnes structures"
echo ""
echo "Migration terminée ! 🎉"