// ============================================================
//  Gestion du thème et des actions système (purge, JWT)
// ============================================================
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const db      = require('../config/db');

// ─── GET /api/parametres — Lire les paramètres ──────────────
const getParametres = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM parametres WHERE Id_admin = ?',
      [req.admin.id]
    );

    // Si pas encore de paramètres, retourner les valeurs par défaut
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        parametres: { Theme: 'système', Id_admin: req.admin.id }
      });
    }

    return res.status(200).json({ success: true, parametres: rows[0] });
  } catch (error) {
    console.error('Erreur getParametres :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── PUT /api/parametres — Mettre à jour le thème ───────────
const updateParametres = async (req, res) => {
  const { theme } = req.body;

  const themesValides = ['clair', 'sombre', 'système'];
  if (!theme || !themesValides.includes(theme)) {
    return res.status(400).json({
      success: false,
      message: `Thème invalide. Valeurs acceptées : ${themesValides.join(', ')}`
    });
  }

  try {
    // Upsert : mettre à jour si existe, créer sinon
    await db.query(
      `INSERT INTO parametres (Theme, Date_modif_param, Id_admin)
       VALUES (?, CURDATE(), ?)
       ON DUPLICATE KEY UPDATE Theme = ?, Date_modif_param = CURDATE()`,
      [theme, req.admin.id, theme]
    );

    return res.status(200).json({
      success: true,
      message: 'Thème mis à jour avec succès.'
    });
  } catch (error) {
    console.error('Erreur updateParametres :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── POST /api/parametres/purge — Vider le cache routes ─────
// Dans ce projet : recharge toutes les routes depuis la DB
const purgeCache = async (req, res) => {
  try {
    // On relit les routes actives (simulation d'un rechargement)
    const [routes] = await db.query(
      'SELECT * FROM routes WHERE Statut_route = 1'
    );

    return res.status(200).json({
      success: true,
      message: `Cache purgé. ${routes.length} route(s) active(s) rechargée(s).`,
      routes_actives: routes.length
    });
  } catch (error) {
    console.error('Erreur purgeCache :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── POST /api/parametres/generer-jwt — Nouveau secret JWT ──
const genererJWT = async (req, res) => {
  try {
    // 1. Générer un secret aléatoire sécurisé (64 octets en hex)
    const nouveauSecret = crypto.randomBytes(64).toString('hex');

    // 2. Désactiver l'ancien secret actif
    await db.query(
      'UPDATE jwt_secrets SET Actif_secret = 0 WHERE Id_admin = ? AND Actif_secret = 1',
      [req.admin.id]
    );

    // 3. Insérer le nouveau secret actif
    await db.query(
      `INSERT INTO jwt_secrets (Valeur_secret, Date_generation, Actif_secret, Id_admin)
       VALUES (?, CURDATE(), 1, ?)`,
      [nouveauSecret, req.admin.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Nouveau secret JWT généré avec succès. Reconnectez-vous.',
      // On renvoie uniquement les 8 premiers caractères pour confirmation visuelle
      apercu: nouveauSecret.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Erreur genererJWT :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getParametres, updateParametres, purgeCache, genererJWT };
