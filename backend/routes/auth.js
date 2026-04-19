// ============================================================
// Routes d'authentification
// ============================================================
const express    = require('express');
const router     = express.Router();
const verifyToken = require('../middleware/auth');
const {
  login,
  getProfil,
  updateProfil
} = require('../controllers/authController');

// POST   /api/auth/login   → Connexion (publique)
router.post('/login', login);

// GET    /api/auth/profil  → Lire le profil (protégée)
router.get('/profil', verifyToken, getProfil);

// PUT    /api/auth/profil  → Modifier le profil (protégée)
router.put('/profil', verifyToken, updateProfil);

module.exports = router;
