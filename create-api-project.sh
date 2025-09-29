#!/bin/bash

# Script de génération de projet API Node.js TypeScript avec Prisma et JWT
# Usage: ./create-api-project.sh <nom-du-projet>

set -e  # Arrêter le script en cas d'erreur

# Vérifier qu'un nom de projet est fourni
if [ $# -eq 0 ]; then
    echo "❌ Erreur: Veuillez fournir un nom de projet"
    echo "Usage: ./create-api-project.sh <nom-du-projet>"
    exit 1
fi

PROJECT_NAME=$1
echo "🚀 Création du projet API: $PROJECT_NAME"

# Créer le dossier principal du projet
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "📁 Création de la structure des dossiers..."

# Créer la structure de dossiers src/
mkdir -p src/{auth,config,constants,controllers,middlewares,repository,routes,schemas,services,types/express,utils}

echo "📦 Création du package.json..."

# Créer le fichier package.json
cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "API REST avec TypeScript, Express, Prisma et JWT",
  "main": "index.js",
  "scripts": {
    "dev": "node --loader ts-node/esm src/index.ts",
    "dev:watch": "node --loader ts-node/esm --watch src/index.ts",
    "build": "npm run generate && tsc",
    "start": "node dist/index.js",
    "start:prod": "npm run build && npm start",
    "postinstall": "npx prisma generate",
    "generate": "npx prisma generate",
    "migrate": "npx prisma migrate dev",
    "migrate:prod": "npx prisma migrate deploy",
    "db:seed": "npx prisma db seed",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["api", "typescript", "express", "prisma", "jwt"],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@prisma/client": "^6.15.0",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "zod": "^4.1.5"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^24.3.0",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.8",
    "prisma": "^6.15.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.2"
  },
  "prisma": {
    "seed": "node ./prisma/seed.js"
  }
}
EOF

echo "⚙️ Création du tsconfig.json..."

# Créer le fichier tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "types": ["node", "express"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": false,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
EOF

echo "🔒 Création du fichier .env.example..."

# Créer le fichier .env.example
cat > .env.example << EOF
NODE_ENV=development
PORT=3003
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
JWT_SECRET="your_jwt_secret_key_here"
JWT_REFRESH_SECRET="your_refresh_jwt_secret_key_here"
FRONTEND_URL="http://localhost:3000"
EOF

echo "📝 Création du .gitignore..."

# Créer le fichier .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build output
dist/
build/

# TypeScript
*.tsbuildinfo

# Prisma
prisma/migrations/*
!prisma/migrations/migration_lock.toml

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Docker
.dockerignore
EOF

echo "📖 Création du README.md..."

# Créer le fichier README.md
cat > README.md << EOF
# $PROJECT_NAME

API REST développée avec TypeScript, Express, Prisma et JWT.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (version 18+)
- MySQL ou PostgreSQL
- npm ou yarn

### Installation

1. **Installer les dépendances :**
\`\`\`bash
npm install
\`\`\`

2. **Configurer l'environnement :**
\`\`\`bash
cp .env.example .env
# Modifier les variables dans .env
\`\`\`

3. **Configurer la base de données :**
\`\`\`bash
# Générer le client Prisma
npm run generate

# Créer et appliquer les migrations
npm run migrate

# (Optionnel) Remplir la base avec des données de test
npm run db:seed
\`\`\`

4. **Démarrer l'application :**
\`\`\`bash
# Mode développement
npm run dev

# Mode développement avec rechargement automatique
npm run dev:watch

# Mode production
npm run start:prod
\`\`\`

## 📁 Structure du projet

\`\`\`
$PROJECT_NAME/
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
\`\`\`

## 🔧 Scripts disponibles

- \`npm run dev\` - Démarrer en mode développement
- \`npm run dev:watch\` - Démarrer avec rechargement automatique
- \`npm run build\` - Compiler TypeScript
- \`npm start\` - Démarrer en mode production
- \`npm run generate\` - Générer le client Prisma
- \`npm run migrate\` - Appliquer les migrations
- \`npm run db:seed\` - Remplir la base avec des données de test

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
\`http://localhost:3003/api-docs\`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit les changements (\`git commit -m 'Add some AmazingFeature'\`)
4. Push vers la branche (\`git push origin feature/AmazingFeature\`)
5. Ouvrir une Pull Request
EOF

echo "🐳 Création du Dockerfile..."

# Créer le Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npm run generate

# Compiler TypeScript
RUN npm run build

# Exposer le port
EXPOSE 3003

# Démarrer l'application
CMD ["npm", "start"]
EOF

echo "🐙 Création du docker-compose.yml..."

# Créer le docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@db:3306/$PROJECT_NAME
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: $PROJECT_NAME
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
EOF

# installation Prisma
npm i -D prisma
npm i @prisma/client
# init prisma
npx prisma init

echo "✅ Structure du projet créée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. cd $PROJECT_NAME"
echo "2. cp .env.example .env"
echo "3. Modifier les variables dans .env"
echo "4. npm install"
echo "5. npm run generate"
echo "6. npm run migrate"
echo "7. npm run dev"
echo ""
echo "📚 Documentation disponible sur : http://localhost:3003/api-docs"
echo ""
echo "🎉 Projet $PROJECT_NAME créé avec succès !"
