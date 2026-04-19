// ============================================================
//  CRUD complet pour la gestion des administrateurs
//  Toutes les fonctions nécessitent : verifyToken + isSuperAdmin
//  SAUF getOwnProfil qui nécessite uniquement verifyToken
// ============================================================
const bcrypt = require('bcryptjs');
const db     = require('../config/db');

// ─── Rôles autorisés dans le système ────────────────────────
const ROLES_AUTORISES = ['Super Admin', 'Assistant', 'Modérateur'];

// ============================================================
//  GET /api/admins
//  Lister tous les administrateurs
//  Accès : Super Admin uniquement
// ============================================================
const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(
      `SELECT
         Id_admin,
         Nom_complet,
         Email,
         Role,
         Date_creation_admin
       FROM admins
       ORDER BY Date_creation_admin DESC`
    );

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error('Erreur getAllAdmins :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ============================================================
//  GET /api/admins/:id
//  Obtenir un admin par son ID
//  Accès : Super Admin OU l'admin lui-même (son propre profil)
// ============================================================
const getAdminById = async (req, res) => {
  const { id } = req.params;

  // Un admin non-SuperAdmin ne peut voir que son propre profil
  if (req.admin.role !== 'Super Admin' && req.admin.id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Vous ne pouvez consulter que votre propre profil.'
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         Id_admin,
         Nom_complet,
         Email,
         Role,
         Date_creation_admin
       FROM admins
       WHERE Id_admin = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Administrateur avec l'ID ${id} introuvable.`
      });
    }

    return res.status(200).json({ success: true, admin: rows[0] });

  } catch (error) {
    console.error('Erreur getAdminById :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ============================================================
//  POST /api/admins
//  Créer un nouvel administrateur
//  Accès : Super Admin uniquement
// ============================================================
const createAdmin = async (req, res) => {
  const { nom_complet, email, mot_de_passe, role } = req.body;

  // ── Validation des champs obligatoires ──────────────────
  if (!nom_complet || !email || !mot_de_passe) {
    return res.status(400).json({
      success: false,
      message: 'nom_complet, email et mot_de_passe sont obligatoires.'
    });
  }

  // ── Validation du rôle ──────────────────────────────────
  const roleFinal = role || 'Assistant';
  if (!ROLES_AUTORISES.includes(roleFinal)) {
    return res.status(400).json({
      success: false,
      message: `Rôle invalide. Valeurs acceptées : ${ROLES_AUTORISES.join(', ')}`
    });
  }

  // ── Validation format email ──────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'email invalide.'
    });
  }

  // ── Validation longueur mot de passe ────────────────────
  if (mot_de_passe.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Le mot de passe doit contenir au moins 6 caractères.'
    });
  }

  try {
    // ── Vérifier que l'email n'est pas déjà utilisé ─────
    const [existing] = await db.query(
      'SELECT Id_admin FROM admins WHERE Email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `L'email "${email}" est déjà utilisé par un autre administrateur.`
      });
    }

    // ── Hasher le mot de passe avec bcrypt ───────────────
    const hash = await bcrypt.hash(mot_de_passe, 10);

    // ── Insérer le nouvel admin ──────────────────────────
    const [result] = await db.query(
      `INSERT INTO admins
         (Nom_complet, Email, Mot_de_passe, Role, Date_creation_admin)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [nom_complet, email, hash, roleFinal]
    );

    return res.status(201).json({
      success: true,
      message: `Administrateur "${nom_complet}" créé avec succès.`,
      admin: {
        id:          result.insertId,
        nom_complet: nom_complet,
        email:       email,
        role:        roleFinal
      }
    });

  } catch (error) {
    console.error('Erreur createAdmin :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ============================================================
//  PUT /api/admins/:id
//  Modifier un administrateur existant
//  Accès : Super Admin uniquement
//  Note  : Un Super Admin ne peut pas rétrograder le dernier
//          Super Admin (y compris lui-même)
// ============================================================
const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { nom_complet, email, mot_de_passe, role } = req.body;

  try {
    // ── Vérifier que l'admin cible existe ───────────────
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE Id_admin = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Administrateur avec l'ID ${id} introuvable.`
      });
    }

    const adminCible = rows[0];

    // ── Vérifier la protection du dernier Super Admin ───
    // Si on essaie de changer le rôle d'un Super Admin
    if (role && role !== 'Super Admin' && adminCible.Role === 'Super Admin') {
      const [superAdmins] = await db.query(
        'SELECT COUNT(*) AS total FROM admins WHERE Role = ?',
        ['Super Admin']
      );

      if (superAdmins[0].total <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Impossible de changer le rôle : c\'est le dernier Super Admin du système.'
        });
      }
    }

    // ── Validation du rôle si fourni ────────────────────
    if (role && !ROLES_AUTORISES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Rôle invalide. Valeurs acceptées : ${ROLES_AUTORISES.join(', ')}`
      });
    }

    // ── Vérifier l'unicité du nouvel email ───────────────
    if (email && email !== adminCible.Email) {
      const [emailExist] = await db.query(
        'SELECT Id_admin FROM admins WHERE Email = ? AND Id_admin != ?',
        [email, id]
      );
      if (emailExist.length > 0) {
        return res.status(409).json({
          success: false,
          message: `L'email "${email}" est déjà utilisé par un autre administrateur.`
        });
      }
    }

    // ── Hasher le nouveau mot de passe si fourni ────────
    let nouveauHash = adminCible.Mot_de_passe; // Garder l'ancien par défaut
    if (mot_de_passe) {
      if (mot_de_passe.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
        });
      }
      nouveauHash = await bcrypt.hash(mot_de_passe, 10);
    }

    // ── Effectuer la mise à jour ─────────────────────────
    await db.query(
      `UPDATE admins
       SET
         Nom_complet  = COALESCE(?, Nom_complet),
         Email        = COALESCE(?, Email),
         Mot_de_passe = ?,
         Role         = COALESCE(?, Role)
       WHERE Id_admin = ?`,
      [
        nom_complet || null,
        email       || null,
        nouveauHash,
        role        || null,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: `Administrateur ID ${id} mis à jour avec succès.`
    });

  } catch (error) {
    console.error('Erreur updateAdmin :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ============================================================
//  DELETE /api/admins/:id
//  Supprimer un administrateur
//  Accès : Super Admin uniquement
//  Règles :
//    - Impossible de supprimer le dernier Super Admin
//    - Impossible de se supprimer soi-même
// ============================================================
const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const idCible = parseInt(id);

  // ── Empêcher l'auto-suppression ──────────────────────
  if (req.admin.id === idCible) {
    return res.status(403).json({
      success: false,
      message: 'Vous ne pouvez pas supprimer votre propre compte administrateur.'
    });
  }

  try {
    // ── Vérifier que l'admin cible existe ───────────────
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE Id_admin = ?',
      [idCible]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Administrateur avec l'ID ${idCible} introuvable.`
      });
    }

    const adminCible = rows[0];

    // ── Protection du dernier Super Admin ───────────────
    if (adminCible.Role === 'Super Admin') {
      const [superAdmins] = await db.query(
        'SELECT COUNT(*) AS total FROM admins WHERE Role = ?',
        ['Super Admin']
      );

      if (superAdmins[0].total <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Impossible de supprimer le dernier Super Admin du système.'
        });
      }
    }

    // ── Effectuer la suppression ─────────────────────────
    // Les données liées (routes, logs, jwt_secrets, parametres)
    // seront supprimées automatiquement grâce à ON DELETE CASCADE
    await db.query('DELETE FROM admins WHERE Id_admin = ?', [idCible]);

    return res.status(200).json({
      success: true,
      message: `Administrateur "${adminCible.Nom_complet}" supprimé avec succès.`
    });

  } catch (error) {
    console.error('Erreur deleteAdmin :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ============================================================
//  GET /api/admins/stats
//  Statistiques sur les admins (nombre par rôle)
//  Accès : Super Admin uniquement
// ============================================================
const getAdminsStats = async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT
         Role,
         COUNT(*) AS total
       FROM admins
       GROUP BY Role
       ORDER BY total DESC`
    );

    const [total] = await db.query('SELECT COUNT(*) AS total FROM admins');

    return res.status(200).json({
      success: true,
      total:   total[0].total,
      par_role: stats
    });

  } catch (error) {
    console.error('Erreur getAdminsStats :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminsStats
};
