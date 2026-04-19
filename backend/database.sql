-- ============================================================
--  API GATEWAY — Script SQL complet
--  Exécutez ce fichier dans MySQL Workbench ou phpMyAdmin
--  ou via : mysql -u root -p < database.sql
-- ============================================================

-- 1. Création de la base
CREATE DATABASE IF NOT EXISTS api_gateway_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE api_gateway_db;

-- ============================================================
--  TABLE ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  Id_admin           INT          NOT NULL AUTO_INCREMENT,
  Nom_complet        VARCHAR(100) NOT NULL,
  Email              VARCHAR(100) NOT NULL UNIQUE,
  Mot_de_passe       VARCHAR(255) NOT NULL,
  Role               VARCHAR(50)  NOT NULL DEFAULT 'Super Admin',
  Date_creation_admin DATE        NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (Id_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  TABLE JWT_SECRETS
-- ============================================================
CREATE TABLE IF NOT EXISTS jwt_secrets (
  Id_secret       INT          NOT NULL AUTO_INCREMENT,
  Valeur_secret   VARCHAR(500) NOT NULL,
  Date_generation DATE         NOT NULL DEFAULT (CURRENT_DATE),
  Actif_secret    TINYINT(1)   NOT NULL DEFAULT 1,
  Id_admin        INT          NOT NULL,
  PRIMARY KEY (Id_secret),
  FOREIGN KEY (Id_admin) REFERENCES admins(Id_admin) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  TABLE ROUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  Id_route            INT          NOT NULL AUTO_INCREMENT,
  Path                VARCHAR(255) NOT NULL UNIQUE,
  Target_url          VARCHAR(500) NOT NULL,
  Methode_http        VARCHAR(10)  NOT NULL DEFAULT 'ALL',
  Statut_route        TINYINT(1)   NOT NULL DEFAULT 1,
  Description_route   VARCHAR(255)     NULL,
  Date_creation_route DATE         NOT NULL DEFAULT (CURRENT_DATE),
  Id_admin            INT          NOT NULL,
  PRIMARY KEY (Id_route),
  FOREIGN KEY (Id_admin) REFERENCES admins(Id_admin) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  TABLE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
  Id_log           INT          NOT NULL AUTO_INCREMENT,
  Methode_log      VARCHAR(10)  NOT NULL,
  Code_statut      INT          NOT NULL,
  Temps_reponse_ms INT          NOT NULL DEFAULT 0,
  Date_heure       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Ip_source        VARCHAR(45)      NULL,
  Message_erreur   VARCHAR(500)     NULL,
  Id_route         INT          NOT NULL,
  PRIMARY KEY (Id_log),
  FOREIGN KEY (Id_route) REFERENCES routes(Id_route) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  TABLE PARAMETRES
-- ============================================================
CREATE TABLE IF NOT EXISTS parametres (
  Id_parametre    INT         NOT NULL AUTO_INCREMENT,
  Theme           VARCHAR(20) NOT NULL DEFAULT 'système',
  Date_modif_param DATE       NOT NULL DEFAULT (CURRENT_DATE),
  Id_admin        INT         NOT NULL UNIQUE,
  PRIMARY KEY (Id_parametre),
  FOREIGN KEY (Id_admin) REFERENCES admins(Id_admin) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  DONNÉES INITIALES
--  Email   : apigetway@admin.com
--  Mot de passe : 12345676
--  (hash généré automatiquement avec bcrypt)
-- ============================================================

INSERT INTO admins (Nom_complet, Email, Mot_de_passe, Role, Date_creation_admin)
VALUES (
  'Administrateur Système',
  'apigetway@admin.com',
  '$2a$10$kpHwFBCPpoNbALTXQLfURu37maTyrA4eq5AsnMIttGg32B8et1tTC',
  'Super Admin',
  CURDATE()
);

-- Paramètres par défaut pour l'admin
INSERT INTO parametres (Theme, Date_modif_param, Id_admin)
VALUES ('système', CURDATE(), 1);

-- Secret JWT initial
INSERT INTO jwt_secrets (Valeur_secret, Date_generation, Actif_secret, Id_admin)
VALUES ('initialSecret_changezMoi_2026', CURDATE(), 1, 1);

-- Routes d'exemple
INSERT INTO routes (Path, Target_url, Methode_http, Statut_route, Description_route, Date_creation_route, Id_admin)
VALUES
  ('/users',    'http://localhost:3001', 'ALL',    1, 'Service utilisateurs',  CURDATE(), 1),
  ('/products', 'http://localhost:3002', 'GET',    1, 'Service produits',      CURDATE(), 1),
  ('/auth',     'http://localhost:3003', 'POST',   0, 'Service authentification', CURDATE(), 1),
  ('/orders',   'http://localhost:3004', 'ALL',    1, 'Service commandes',     CURDATE(), 1);

-- Logs d'exemple
INSERT INTO logs (Methode_log, Code_statut, Temps_reponse_ms, Date_heure, Ip_source, Message_erreur, Id_route)
VALUES
  ('GET',    200, 45,  NOW(), '127.0.0.1', NULL,                    1),
  ('POST',   401, 112, NOW(), '127.0.0.1', 'Unauthorized',          3),
  ('GET',    200, 89,  NOW(), '192.168.1.1', NULL,                  2),
  ('GET',    404, 23,  NOW(), '10.0.0.1',  'Resource not found',    1),
  ('DELETE', 500, 400, NOW(), '127.0.0.1', 'Internal server error', 1);

SELECT 'Base de données créée avec succès !' AS message;