// ============================================================
// Paramètres et actions système
// ============================================================
const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getParametres,
  updateParametres,
  purgeCache,
  genererJWT
} = require('../controllers/parametresController');

router.use(verifyToken);

// GET    /api/parametres              → Lire les paramètres
router.get('/', getParametres);

// PUT    /api/parametres              → Modifier le thème
router.put('/', updateParametres);

// POST   /api/parametres/purge        → Purger le cache routes
router.post('/purge', purgeCache);

// POST   /api/parametres/generer-jwt  → Générer nouveau secret JWT
router.post('/generer-jwt', genererJWT);

module.exports = router;
