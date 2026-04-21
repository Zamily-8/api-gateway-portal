# Portail d'API (API Gateway) configurable

> Interface web complète pour configurer, surveiller et administrer une passerelle d'API.  
> Projet réalisé dans le cadre du module **POO sur Plateforme à Composants** — 2025/2026.

---

## Objectif du projet

Une **API Gateway** est un système qui reçoit toutes les requêtes HTTP entrantes et les redirige vers les bons services internes. Ce portail permet aux administrateurs de gérer cette passerelle via une interface web moderne et sécurisée.

**Fonctionnalités principales :**
- 🔒 Authentification JWT (connexion, expiration automatique après 8h)
- 🛣️ CRUD complet des routes API (chemin, URL cible, méthode HTTP, statut)
- 📋 Consultation des logs de requêtes en temps réel
- 👥 Gestion des administrateurs avec système de rôles (Super Admin, Assistant, Modérateur)
- ⚙️ Paramètres système (thème clair/sombre/système, régénération JWT, purge cache)

---

## Stack technique

| Couche | Technologie |
|---|---|
| **Backend** | Node.js + Express.js |
| **Base de données** | MySQL (WampServer) |
| **Authentification** | JWT (jsonwebtoken + bcryptjs) |
| **Frontend** | React.js + Vite + Tailwind CSS v3 |
| **Client HTTP** | Axios |
| **Modélisation BD** | Merise (MCD + MLD) |
| **Versionnement** | Git + GitHub |

---

## Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- [WampServer](https://www.wampserver.com/) (MySQL sur le port 3306)
- Git

---

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/Zamily-8/api-gateway-portal.git
cd api-gateway-portal
```

### 2. Configurer et lancer le backend

```bash
cd backend
npm install
```

Copiez le fichier d'exemple et remplissez vos valeurs :

```bash
copy .env.example .env
```

Contenu du `.env` à remplir :

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=api_gateway_db
JWT_SECRET=monSecretJWT_ChangezMoi_2026!
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

Générez le hash bcrypt du mot de passe par défaut :

```bash
node generer-hash.js
```

Importez `database.sql` dans phpMyAdmin (`http://localhost/phpmyadmin`), puis démarrez le serveur :

```bash
npm run dev
```

Le backend tourne sur **http://localhost:5000**

### 3. Lancer le frontend

```bash
cd ../frontend
npm install
npm run dev
```

Le frontend tourne sur **http://localhost:5173**

### 4. Connexion par défaut

| Champ | Valeur |
|---|---|
| Email | `apigetway@admin.com` |
| Mot de passe | `12345676` |
| Rôle | Super Admin |

---

## Structure du projet

```
api-gateway/
├── backend/
│   ├── config/          # Connexion MySQL
│   ├── controllers/     # Logique métier (auth, admins, routes, logs, parametres)
│   ├── middleware/       # Vérification JWT + contrôle des rôles
│   ├── routes/          # Définition des endpoints API REST
│   ├── server.js        # Point d'entrée Express
│   ├── database.sql     # Script SQL de création de la base
│   └── .env.example     # Modèle des variables d'environnement
│
└── frontend/
    └── src/
        ├── api/         # Configuration Axios (token auto + redirect 401)
        ├── context/     # AuthContext (JWT) + ThemeContext (dark mode)
        ├── components/  # Layout, PageBackground, PrivateRoute, SuperAdminRoute
        ├── hooks/       # usePageBackground (images par page)
        └── pages/       # Login, Dashboard, Logs, Profil, Parametres, Admins
```

---

## API REST — Endpoints principaux

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Non | Connexion → token JWT |
| GET | `/api/auth/profil` | JWT | Lire son profil |
| PUT | `/api/auth/profil` | JWT | Modifier profil + mot de passe |
| GET | `/api/routes` | JWT | Lister toutes les routes |
| POST | `/api/routes` | JWT | Créer une route |
| PUT | `/api/routes/:id` | JWT | Modifier une route |
| DELETE | `/api/routes/:id` | JWT | Supprimer une route |
| GET | `/api/logs` | JWT | Consulter les logs |
| DELETE | `/api/logs` | JWT | Vider les logs |
| GET | `/api/admins` | Super Admin | Lister les admins |
| POST | `/api/admins` | Super Admin | Créer un admin |
| PUT | `/api/admins/:id` | Super Admin | Modifier un admin |
| DELETE | `/api/admins/:id` | Super Admin | Supprimer un admin |
| GET | `/api/health` | Non | Vérification santé serveur |

---

## Conception et maquettes

### Maquettes Figma (wireframes)
🎨 [Voir les maquettes sur Figma](https://www.figma.com/make/gqC7hdM4cjZMMfEU9X1VO4/API-Getway-Wireframe?fullscreen=1&t=5gv13GZ4Yp26to8g-1&preview-route=%2Flogin)

### Diagramme de flux utilisateur (FigJam)
🗺️ [Voir le user flow sur FigJam](https://www.figma.com/board/NYeOe9yckgtctvqWn3Bp8c/API-Getway--User-Flow-?node-id=0-1&t=d7pPMqoB0KjmHr7b-1)

---

## Diagrammes de données (Merise)

Les fichiers PDF des diagrammes sont disponibles dans le dossier [`docs/`](./docs/) :

| Fichier | Description |
|---|---|
| [`docs/MCD_API_Gateway.pdf`](./docs/MCD_API_Gateway.pdf) | Modèle Conceptuel de Données |
| [`docs/MLD_API_Gateway.pdf`](./docs/MLD_API_Gateway.pdf) | Modèle Logique de Données |

### Tables de la base de données

```
admins       → Id_admin, Nom_complet, Email, Mot_de_passe, Role, Date_creation_admin
routes       → Id_route, Path, Target_url, Methode_http, Statut_route, Description_route, Id_admin (FK)
logs         → Id_log, Methode_log, Code_statut, Temps_reponse_ms, Date_heure, Ip_source, Id_route (FK)
parametres   → Id_parametre, Theme, Date_modif_param, Id_admin (FK UNIQUE)
jwt_secrets  → Id_secret, Valeur_secret, Date_generation, Actif_secret, Id_admin (FK)
```

---

## Sécurité

- Mots de passe hachés avec **bcrypt** (10 rounds) — jamais stockés en clair
- Authentification par **JWT** avec expiration configurable (8h par défaut)
- **Middleware de vérification** sur toutes les routes protégées
- **Contrôle des rôles** : seul le Super Admin peut créer/modifier/supprimer des admins
- **Protection du dernier Super Admin** : suppression impossible s'il est le seul

---

## Auteur

**[EFRANCEL Zamily]**  
Module : POO sur Plateforme à Composants — 2025/2026  
Dépôt : [github.com/Zamily-8/api-gateway-portal](https://github.com/Zamily-8/api-gateway-portal)
