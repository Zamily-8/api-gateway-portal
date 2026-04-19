// ============================================================
//  Routes CRUD pour la gestion des administrateurs
//
//  Protection double :
//    - verifyToken   → vérifie que l'utilisateur est connecté
//    - isSuperAdmin  → vérifie que le rôle est "Super Admin"
//
//  Exception : GET /:id est accessible à tout admin connecté
//              (mais filtre dans le controller selon le rôle)
// ============================================================
const express       = require('express');
const router        = express.Router();
const verifyToken   = require('../middleware/auth');
const isSuperAdmin  = require('../middleware/isSuperAdmin');
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminsStats
} = require('../controllers/adminsController');

// ── GET  /api/admins/stats  → Statistiques (Super Admin) ────
router.get('/stats', verifyToken, isSuperAdmin, getAdminsStats);

// ── GET  /api/admins        → Tous les admins (Super Admin) ─
router.get('/', verifyToken, isSuperAdmin, getAllAdmins);

// ── GET  /api/admins/:id    → Un admin (soi-même ou Super Admin)
// Note : isSuperAdmin N'EST PAS appliqué ici car un admin
//        normal peut consulter son propre profil via cette route.
//        La restriction est gérée dans le controller.
router.get('/:id', verifyToken, getAdminById);

// ── POST /api/admins        → Créer un admin (Super Admin) ──
router.post('/', verifyToken, isSuperAdmin, createAdmin);

// ── PUT  /api/admins/:id    → Modifier un admin (Super Admin)
router.put('/:id', verifyToken, isSuperAdmin, updateAdmin);

// ── DELETE /api/admins/:id  → Supprimer un admin (Super Admin)
router.delete('/:id', verifyToken, isSuperAdmin, deleteAdmin);

module.exports = router;
