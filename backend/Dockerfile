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
