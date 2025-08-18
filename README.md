# 📝 Ynov Certif – Todolist App

[![CI Backend](https://github.com/Timothee-Picard/ynov-certif/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/Timothee-Picard/ynov-certif/actions/workflows/ci-backend.yml)
[![CI Frontend](https://github.com/Timothee-Picard/ynov-certif/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/Timothee-Picard/ynov-certif/actions/workflows/ci-frontend.yml)
[![Tag](https://img.shields.io/github/v/tag/Timothee-Picard/ynov-certif?label=latest%20tag&sort=semver)](https://github.com/Timothee-Picard/ynov-certif/tags)


Application **Todolist** développée avec **NestJS** (backend) et **Next.js** (frontend).  
Projet utilisé pour la certification Ynov.

---

## 🚀 Déploiements

- **Préproduction**
    - Frontend : [https://ynov-certif-front-preprod.timothee-picard.dev](https://ynov-certif-front-preprod.timothee-picard.dev)
    - Backend : [https://ynov-certif-back-preprod.timothee-picard.dev](https://ynov-certif-back-preprod.timothee-picard.dev)

- **Production**
    - Frontend : [https://ynov-certif-front.timothee-picard.dev](https://ynov-certif-front.timothee-picard.dev)
    - Backend : [https://ynov-certif-back.timothee-picard.dev](https://ynov-certif-back.timothee-picard.dev)

---

## 🛠️ Installation et développement

### Prérequis
- [Docker](https://docs.docker.com/get-docker/)
- [Make](https://www.gnu.org/software/make/)
- [Node.js 22.17.1](https://nodejs.org/) (gestion via `.tool-versions`) – utile pour initialiser les `node_modules` en local

### Démarrage rapide
Initialiser le projet (backend + frontend)
```bash
make init
```
Lancer l’environnement Docker
```bash
make up
```
ou avec build forcé
```bash
make up-build
```
Arrêter les services
```bash
make down
```
Voir les logs d’un service
```bash
make logs service=backend
```
```bash
make logs service=frontend
```
⚙️ Variables d’environnement
```bash
APP_ENV=dev
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
JWT_SECRET=monSuperSecretJWT
```
Les fichiers .env.example sont copiés automatiquement lors de make init.

### 📦 Gestion des versions
Ce projet utilise standard-version et le format SemVer :

Générer une nouvelle release (patch/minor/major choisi automatiquement)
```bash
npm run release
```
Ou manuellement
```bash
npm run release:patch
```
```bash
npm run release:minor
```
```bash
npm run release:major
```

Déployer (push commits + tags)
```bash
npm run release:push
```
La branche main est déployée en préproduction.

Le tag Git déclenche le déploiement en production.

## 📜 Licence
Ce projet est sous licence [MIT](./LICENSE).