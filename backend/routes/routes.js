// ============================================================
// CRUD des routes API (Table de bord)
// ============================================================
const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} = require('../controllers/routesController');

// Toutes les routes sont protégées par le JWT
router.use(verifyToken);

// GET    /api/routes       → Lister toutes les routes
router.get('/',    getAllRoutes);

// GET    /api/routes/:id   → Obtenir une route par ID
router.get('/:id', getRouteById);

// POST   /api/routes       → Créer une nouvelle route
router.post('/',   createRoute);

// PUT    /api/routes/:id   → Modifier une route
router.put('/:id', updateRoute);

// DELETE /api/routes/:id   → Supprimer une route
router.delete('/:id', deleteRoute);

module.exports = router;
