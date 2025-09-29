# backend

API REST développée avec TypeScript, Express, Prisma et JWT.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (version 18+)
- MySQL ou PostgreSQL
- npm ou yarn

### Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configurer l'environnement :**
```bash
cp .env.example .env
# Modifier les variables dans .env
```

3. **Configurer la base de données :**
```bash
# Générer le client Prisma
npm run generate

# Créer et appliquer les migrations
npm run migrate

# (Optionnel) Remplir la base avec des données de test
npm run db:seed
```

4. **Démarrer l'application :**
```bash
# Mode développement
npm run dev

# Mode développement avec rechargement automatique
npm run dev:watch

# Mode production
npm run start:prod
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── auth/              # Authentification JWT
│   ├── config/            # Configuration (DB, Swagger, etc.)
│   ├── constants/         # Constantes (status HTTP, messages)
│   ├── controllers/       # Contrôleurs (logique métier)
│   ├── middlewares/       # Middlewares (auth, validation, erreurs)
│   ├── repository/        # Couche d'accès aux données
│   ├── routes/            # Définition des routes
│   ├── schemas/           # Schémas de validation Zod
│   ├── services/          # Services métier
│   ├── types/             # Types TypeScript
│   ├── utils/             # Fonctions utilitaires
│   └── index.ts           # Point d'entrée de l'application
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Scripts disponibles

- `npm run dev` - Démarrer en mode développement
- `npm run dev:watch` - Démarrer avec rechargement automatique
- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer en mode production
- `npm run generate` - Générer le client Prisma
- `npm run migrate` - Appliquer les migrations
- `npm run db:seed` - Remplir la base avec des données de test

## 🔑 Fonctionnalités

- ✅ API REST avec Express
- ✅ TypeScript avec configuration stricte
- ✅ Authentification JWT
- ✅ Validation des données avec Zod
- ✅ ORM Prisma pour la base de données
- ✅ Documentation Swagger automatique
- ✅ Gestion des erreurs centralisée
- ✅ Architecture en couches (Repository pattern)
- ✅ Middlewares d'authentification et validation

## 📚 Documentation API

Une fois l'application démarrée, la documentation Swagger est disponible à :
`http://localhost:3003/api-docs`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
