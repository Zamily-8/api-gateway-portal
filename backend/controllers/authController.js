// ============================================================
//  Gère la connexion et la récupération du profil admin
// ============================================================
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
require('dotenv').config();

// ─── POST /api/auth/login ────────────────────────────────────
const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  // Validation basique
  if (!email || !mot_de_passe) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis.'
    });
  }

  try {
    // 1. Chercher l'admin par email
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE Email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    const admin = rows[0];

    // 2. Comparer le mot de passe avec le hash bcrypt
    const motDePasseValide = await bcrypt.compare(mot_de_passe, admin.Mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // 3. Générer le token JWT
    const token = jwt.sign(
      {
        id:    admin.Id_admin,
        email: admin.Email,
        role:  admin.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // 4. Retourner le token et les infos (sans le mot de passe)
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      admin: {
        id:          admin.Id_admin,
        nom_complet: admin.Nom_complet,
        email:       admin.Email,
        role:        admin.Role
      }
    });

  } catch (error) {
    console.error('Erreur login :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─── GET /api/auth/profil ────────────────────────────────────
const getProfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Id_admin, Nom_complet, Email, Role, Date_creation_admin FROM admins WHERE Id_admin = ?',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin introuvable.' });
    }

    return res.status(200).json({ success: true, admin: rows[0] });
  } catch (error) {
    console.error('Erreur getProfil :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── PUT /api/auth/profil ────────────────────────────────────
const updateProfil = async (req, res) => {
  const { nom_complet, email, mot_de_passe_actuel, nouveau_mot_de_passe } = req.body;

  try {
    // Récupérer l'admin actuel
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE Id_admin = ?',
      [req.admin.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin introuvable.' });
    }

    const admin = rows[0];
    let nouveauHash = admin.Mot_de_passe;

    // Changement de mot de passe — vérifier l'ancien
    if (nouveau_mot_de_passe) {
      if (!mot_de_passe_actuel) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe actuel est requis pour en définir un nouveau.'
        });
      }
      const valide = await bcrypt.compare(mot_de_passe_actuel, admin.Mot_de_passe);
      if (!valide) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect.'
        });
      }
      nouveauHash = await bcrypt.hash(nouveau_mot_de_passe, 10);
    }

    // Mise à jour
    await db.query(
      'UPDATE admins SET Nom_complet = ?, Email = ?, Mot_de_passe = ? WHERE Id_admin = ?',
      [
        nom_complet || admin.Nom_complet,
        email       || admin.Email,
        nouveauHash,
        req.admin.id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès.'
    });

  } catch (error) {
    console.error('Erreur updateProfil :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { login, getProfil, updateProfil };
