# Portail d'Administration API Gateway

Mini-projet réalisé dans le cadre du module **POO sur Plateforme à Composants** — 2025/2026.

## Description
Interface web d'administration pour une API Gateway permettant de gérer les routes,
les logs, les administrateurs et les paramètres du système.

## Stack technique
- **Frontend** : React.js + Vite + Tailwind CSS
- **Backend** : Node.js + Express.js
- **Base de données** : MySQL (WampServer)
- **Authentification** : JWT

## Prérequis
- Node.js v18+
- WampServer (MySQL sur port 3306)

## Installation

### Backend
```bash
cd backend
npm install

node generer-hash.js  # Générer le hash du mot de passe
# Importer database.sql dans phpMyAdmin
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Accès
- Frontend : http://localhost:5173
- Backend : http://localhost:5000
- Email par défaut : apigetway@admin.com
- Mot de passe : 12345676