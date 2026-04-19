// ============================================================
//  À utiliser APRÈS le middleware verifyToken (auth.js)
//  Vérifie que l'admin connecté est bien un "Super Admin"
//  Utilisation : router.post('/', verifyToken, isSuperAdmin, createAdmin)
// ============================================================

const isSuperAdmin = (req, res, next) => {
  // req.admin est injecté par verifyToken (contient id, email, role)
  if (!req.admin || req.admin.role !== 'Super Admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Seul un Super Admin peut effectuer cette action.'
    });
  }
  next();
};

module.exports = isSuperAdmin;
