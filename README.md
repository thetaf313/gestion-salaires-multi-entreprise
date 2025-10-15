# Synergy Pay - Gestion des Salaires Multi-Entreprise

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-purple.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 🌟 Présentation

**Synergy Pay** est une plateforme moderne et robuste de gestion des salaires conçue pour les entreprises multi-entités. Elle offre une solution complète pour la gestion des employés, des contrats, des bulletins de salaire et des rapports analytiques, avec une architecture frontend/backend séparée pour une scalabilité optimale.

### ✨ Fonctionnalités Clés

- **🔐 Authentification Sécurisée** : Système JWT pour une gestion des utilisateurs et rôles (Admin, Employé).
- **🏢 Gestion Multi-Entreprise** : Support pour plusieurs entreprises avec isolation des données.
- **👥 Gestion des Employés** : CRUD complet des employés avec informations détaillées.
- **📄 Gestion des Contrats** : Types de contrats normalisés (Fixe, Journalier, Honoraire).
- **💰 Calcul des Salaires** : Automatisation des bulletins de salaire par cycle de paie.
- **📊 Tableaux de Bord Interactifs** : Graphiques et statistiques en temps réel avec Recharts.
- **📈 Rapports Avancés** : Analyses mensuelles, répartitions par type de contrat, coûts par département.
- **🐳 Déploiement Docker** : Configuration prête pour le déploiement en conteneurs.
- **🔄 API RESTful** : Backend TypeScript avec Express et Prisma ORM.

## 🛠️ Pile Technologique

### Frontend
- **React 18** avec Hooks et Context API
- **Vite** pour le bundling et le développement rapide
- **Tailwind CSS** pour le styling moderne
- **Axios** pour les appels API
- **Recharts** pour les visualisations de données
- **React Router** pour la navigation

### Backend
- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **Prisma** ORM avec migrations automatiques
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **CORS** et validation des schémas

### Base de Données
- **PostgreSQL** ou **MySQL** (configurable)
- **Prisma Studio** pour la gestion visuelle

### Déploiement
- **Docker** et **Docker Compose** pour l'orchestration

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Docker et Docker Compose (optionnel, pour le déploiement conteneurisé)
- Base de données PostgreSQL ou MySQL

### Installation Rapide avec Docker (Recommandé)

1. **Cloner le dépôt :**
```bash
git clone https://github.com/thetaf313/gestion-salaires-multi-entreprise.git
cd gestion-salaires-multi-entreprise
```

2. **Configurer l'environnement :**
```bash
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos variables (DB_URL, JWT_SECRET, etc.)
```

3. **Démarrer avec Docker Compose :**
```bash
docker-compose up --build
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- Prisma Studio : http://localhost:5555

### Installation Manuelle

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer .env
npm run generate
npm run migrate
npm run db:seed  # Optionnel
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📖 Utilisation

### Interface Utilisateur
- **Connexion** : Utilisez les identifiants admin pour accéder au dashboard.
- **Dashboard** : Vue d'ensemble avec statistiques et graphiques.
- **Gestion des Employés** : Ajouter, modifier, supprimer des employés.
- **Rapports** : Analyses détaillées par entreprise et période.

### API Endpoints Principaux
- `POST /api/auth/login` - Authentification
- `GET /api/companies` - Liste des entreprises
- `GET /api/employees` - Liste des employés
- `GET /api/statistics/company/:id` - Statistiques par entreprise
- `POST /api/payrolls` - Création de bulletins de salaire

Pour la documentation complète de l'API, consultez [Postman Collection](./docs/api.postman_collection.json) ou Swagger UI.

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code
- Utiliser ESLint et Prettier
- Écrire des tests pour les nouvelles fonctionnalités
- Respecter les conventions TypeScript

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur Principal** : [Votre Nom](https://github.com/thetaf313)
- **Contributeurs** : Bienvenue à bord !

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Synergy Pay** - Simplifiez la gestion des salaires, boostez votre productivité ! 🚀</content>
<parameter name="filePath">/home/twist/dev-web-ecsa/react/projects-react-js/gestion-salaires-multi-entreprise/README.md