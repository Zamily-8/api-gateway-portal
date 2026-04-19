// ============================================================
//  CRUD complet pour la gestion des routes API (Table de bord)
// ============================================================
const db = require('../config/db');

// ─── GET /api/routes — Toutes les routes ────────────────────
const getAllRoutes = async (req, res) => {
  try {
    const [routes] = await db.query(
      `SELECT
         r.Id_route,
         r.Path,
         r.Target_url,
         r.Methode_http,
         r.Statut_route,
         r.Description_route,
         r.Date_creation_route,
         a.Nom_complet AS createur
       FROM routes r
       JOIN admins a ON r.Id_admin = a.Id_admin
       ORDER BY r.Date_creation_route DESC`
    );

    return res.status(200).json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    console.error('Erreur getAllRoutes :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── GET /api/routes/:id — Une seule route ──────────────────
const getRouteById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM routes WHERE Id_route = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Route introuvable.' });
    }
    return res.status(200).json({ success: true, route: rows[0] });
  } catch (error) {
    console.error('Erreur getRouteById :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── POST /api/routes — Créer une nouvelle route ────────────
const createRoute = async (req, res) => {
  const { path, target_url, methode_http, statut_route, description_route } = req.body;

  // Validation des champs obligatoires
  if (!path || !target_url) {
    return res.status(400).json({
      success: false,
      message: 'Le path et le target_url sont obligatoires.'
    });
  }

  try {
    // Vérifier que le path n'existe pas déjà
    const [existing] = await db.query(
      'SELECT Id_route FROM routes WHERE Path = ?',
      [path]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Le path "${path}" existe déjà.`
      });
    }

    const [result] = await db.query(
      `INSERT INTO routes
         (Path, Target_url, Methode_http, Statut_route, Description_route, Date_creation_route, Id_admin)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
      [
        path,
        target_url,
        methode_http     || 'ALL',
        statut_route !== undefined ? statut_route : 1,
        description_route || null,
        req.admin.id
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Route créée avec succès.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur createRoute :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── PUT /api/routes/:id — Modifier une route ───────────────
const updateRoute = async (req, res) => {
  const { id } = req.params;
  const { path, target_url, methode_http, statut_route, description_route } = req.body;

  try {
    // Vérifier que la route existe
    const [existing] = await db.query(
      'SELECT Id_route FROM routes WHERE Id_route = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Route introuvable.' });
    }

    await db.query(
      `UPDATE routes
       SET Path = COALESCE(?, Path),
           Target_url = COALESCE(?, Target_url),
           Methode_http = COALESCE(?, Methode_http),
           Statut_route = COALESCE(?, Statut_route),
           Description_route = COALESCE(?, Description_route)
       WHERE Id_route = ?`,
      [path, target_url, methode_http, statut_route, description_route, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Route mise à jour avec succès.'
    });
  } catch (error) {
    console.error('Erreur updateRoute :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── DELETE /api/routes/:id — Supprimer une route ───────────
const deleteRoute = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query(
      'SELECT Id_route FROM routes WHERE Id_route = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Route introuvable.' });
    }

    // Les logs liés seront supprimés automatiquement (ON DELETE CASCADE)
    await db.query('DELETE FROM routes WHERE Id_route = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Route supprimée avec succès.'
    });
  } catch (error) {
    console.error('Erreur deleteRoute :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute };
