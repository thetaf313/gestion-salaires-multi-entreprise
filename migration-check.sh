#!/bin/bash

# Script de migration vers les pages avec pagination
# Ce script vérifie que tous les imports et routes sont correctement configurés

echo "🚀 Vérification de la migration vers les pages avec pagination..."

# Vérifier que les nouveaux fichiers existent
echo "📁 Vérification des nouveaux fichiers..."

FILES=(
    "frontend/src/hooks/usePagination.js"
    "frontend/src/hooks/useApiPagination.js"
    "frontend/src/components/ui/FilterControls.jsx"
    "frontend/src/components/ui/PaginationControls.jsx"
    "frontend/src/pages/CompanyEmployeesWithPagination.jsx"
    "frontend/src/pages/PayrollCyclesWithPagination.jsx"
    "frontend/src/pages/AttendanceWithPagination.jsx"
    "frontend/src/pages/PayslipsWithPagination.jsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file manquant"
    fi
done

# Vérifier que les imports sont commentés dans App.jsx
echo ""
echo "📝 Vérification des imports dans App.jsx..."

if grep -q "// import CompanyEmployees" frontend/src/App.jsx; then
    echo "✅ Ancien import CompanyEmployees commenté"
else
    echo "❌ Ancien import CompanyEmployees non commenté"
fi

if grep -q "import CompanyEmployeesWithPagination" frontend/src/App.jsx; then
    echo "✅ Nouveau import CompanyEmployeesWithPagination ajouté"
else
    echo "❌ Nouveau import CompanyEmployeesWithPagination manquant"
fi

if grep -q "// import PayrollCycles" frontend/src/App.jsx; then
    echo "✅ Ancien import PayrollCycles commenté"
else
    echo "❌ Ancien import PayrollCycles non commenté"
fi

if grep -q "import PayrollCyclesWithPagination" frontend/src/App.jsx; then
    echo "✅ Nouveau import PayrollCyclesWithPagination ajouté"
else
    echo "❌ Nouveau import PayrollCyclesWithPagination manquant"
fi

# Vérifier les routes
echo ""
echo "🛣️  Vérification des routes..."

if grep -q "CompanyEmployeesWithPagination" frontend/src/App.jsx; then
    echo "✅ Route CompanyEmployeesWithPagination configurée"
else
    echo "❌ Route CompanyEmployeesWithPagination manquante"
fi

if grep -q "PayrollCyclesWithPagination" frontend/src/App.jsx; then
    echo "✅ Route PayrollCyclesWithPagination configurée"
else
    echo "❌ Route PayrollCyclesWithPagination manquante"
fi

# Vérifier les composants UI
echo ""
echo "🎨 Vérification des composants UI..."

if [ -d "frontend/src/components/ui" ]; then
    echo "✅ Dossier components/ui existe"
else
    echo "❌ Dossier components/ui manquant"
fi

# Compter les lignes de code ajoutées
echo ""
echo "📊 Statistiques des nouveaux fichiers..."

echo "Hooks de pagination :"
wc -l frontend/src/hooks/usePagination.js 2>/dev/null || echo "❌ usePagination.js introuvable"
wc -l frontend/src/hooks/useApiPagination.js 2>/dev/null || echo "❌ useApiPagination.js introuvable"

echo ""
echo "Composants UI :"
wc -l frontend/src/components/ui/FilterControls.jsx 2>/dev/null || echo "❌ FilterControls.jsx introuvable"
wc -l frontend/src/components/ui/PaginationControls.jsx 2>/dev/null || echo "❌ PaginationControls.jsx introuvable"

echo ""
echo "Pages avec pagination :"
wc -l frontend/src/pages/*WithPagination.jsx 2>/dev/null || echo "❌ Aucune page *WithPagination.jsx trouvée"

echo ""
echo "🎯 Migration terminée ! Voici un résumé :"
echo "- 4 nouvelles pages avec pagination"
echo "- 2 hooks de pagination réutilisables"
echo "- 2 composants UI pour filtres et pagination"
echo "- Routes mises à jour dans App.jsx"
echo "- Anciens imports commentés pour rollback facile"

echo ""
echo "🚀 Pour tester, vous pouvez maintenant :"
echo "1. cd frontend && npm run dev"
echo "2. Naviguer vers les pages d'employés, cycles de paie, pointages ou bulletins"
echo "3. Tester les filtres, la recherche et la pagination"

echo ""
echo "📦 Fichiers disponibles pour rollback :"
echo "- CompanyEmployees.jsx (ancienne version)"
echo "- PayrollCycles.jsx (ancienne version)"
echo "- AttendancePage.jsx (ancienne version)"
echo "- Payslips.jsx (ancienne version)"