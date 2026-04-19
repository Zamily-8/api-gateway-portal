// ============================================================
//  Consultation et filtrage des logs de requêtes
// ============================================================
const db = require('../config/db');

// ─── GET /api/logs — Tous les logs (avec filtre optionnel) ──
const getAllLogs = async (req, res) => {
  const { route, statut, search } = req.query;

  try {
    let query = `
      SELECT
        l.Id_log,
        l.Methode_log,
        l.Code_statut,
        l.Temps_reponse_ms,
        l.Date_heure,
        l.Ip_source,
        l.Message_erreur,
        r.Path AS route_path
      FROM logs l
      JOIN routes r ON l.Id_route = r.Id_route
    `;

    const params = [];
    const conditions = [];

    // Filtre par route (path)
    if (search) {
      conditions.push('r.Path LIKE ?');
      params.push(`%${search}%`);
    }

    // Filtre par code statut (ex: 200, 404)
    if (statut) {
      conditions.push('l.Code_statut = ?');
      params.push(statut);
    }

    // Filtre par id de route
    if (route) {
      conditions.push('l.Id_route = ?');
      params.push(route);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.Date_heure DESC LIMIT 200';

    const [logs] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Erreur getAllLogs :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── GET /api/logs/:id — Un log précis ──────────────────────
const getLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT l.*, r.Path AS route_path
       FROM logs l
       JOIN routes r ON l.Id_route = r.Id_route
       WHERE l.Id_log = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Log introuvable.' });
    }
    return res.status(200).json({ success: true, log: rows[0] });
  } catch (error) {
    console.error('Erreur getLogById :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── POST /api/logs — Créer un log (usage interne) ──────────
const createLog = async (req, res) => {
  const { methode_log, code_statut, temps_reponse_ms, ip_source, message_erreur, id_route } = req.body;

  if (!methode_log || !code_statut || !id_route) {
    return res.status(400).json({
      success: false,
      message: 'methode_log, code_statut et id_route sont obligatoires.'
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO logs
         (Methode_log, Code_statut, Temps_reponse_ms, Date_heure, Ip_source, Message_erreur, Id_route)
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [
        methode_log,
        code_statut,
        temps_reponse_ms || 0,
        ip_source       || null,
        message_erreur  || null,
        id_route
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Log enregistré.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur createLog :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─── DELETE /api/logs — Vider tous les logs ─────────────────
const clearLogs = async (req, res) => {
  try {
    await db.query('DELETE FROM logs');
    return res.status(200).json({
      success: true,
      message: 'Tous les logs ont été supprimés.'
    });
  } catch (error) {
    console.error('Erreur clearLogs :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getAllLogs, getLogById, createLog, clearLogs };
