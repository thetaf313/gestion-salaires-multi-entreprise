#!/bin/bash

# Script de vérification des erreurs dans les pages avec pagination
echo "🔍 Vérification des erreurs dans les nouvelles pages..."

echo ""
echo "📁 Vérification des imports manquants..."

# Vérifier les imports dans chaque page
echo "1. CompanyEmployeesWithPagination.jsx:"
grep -n "import.*from" frontend/src/pages/CompanyEmployeesWithPagination.jsx | head -10

echo ""
echo "2. PayrollCyclesWithPagination.jsx:"
grep -n "import.*from" frontend/src/pages/PayrollCyclesWithPagination.jsx | head -10

echo ""
echo "3. AttendanceWithPagination.jsx:"
grep -n "import.*from" frontend/src/pages/AttendanceWithPagination.jsx | head -10

echo ""
echo "4. PayslipsWithPagination.jsx:"
grep -n "import.*from" frontend/src/pages/PayslipsWithPagination.jsx | head -10

echo ""
echo "📋 Vérification des services utilisés..."

echo "Services référencés dans les pages:"
grep -r "Service\." frontend/src/pages/*WithPagination.jsx | cut -d: -f1,3 | sort | uniq

echo ""
echo "📁 Services existants:"
ls -la frontend/src/services/*.js | awk '{print $9}' | grep -v "^$"

echo ""
echo "🔧 Vérification des composants UI..."

echo "Composants UI référencés:"
grep -r "from.*components/ui" frontend/src/pages/*WithPagination.jsx | cut -d'"' -f2 | sort | uniq

echo ""
echo "Composants UI existants:"
ls -la frontend/src/components/ui/ | awk '{print $9}' | grep -v "^$" | grep -v "^\."

echo ""
echo "🧩 Vérification des hooks..."

echo "Hooks référencés:"
grep -r "from.*hooks" frontend/src/pages/*WithPagination.jsx frontend/src/components/*Modal.jsx 2>/dev/null | cut -d'"' -f2 | sort | uniq

echo ""
echo "Hooks existants:"
ls -la frontend/src/hooks/ 2>/dev/null | awk '{print $9}' | grep -v "^$" | grep -v "^\." || echo "Dossier hooks inexistant"

echo ""
echo "✅ Suggestions de correction:"
echo "1. Vérifier que tous les services ont les bonnes méthodes exportées"
echo "2. S'assurer que les composants UI existent dans components/ui/"
echo "3. Vérifier que les hooks de pagination sont dans hooks/"
echo "4. Contrôler les imports avec la bonne casse (payRunService vs payrunService)"
echo ""
echo "🚀 Pour tester, exécutez: cd frontend && npm run dev"