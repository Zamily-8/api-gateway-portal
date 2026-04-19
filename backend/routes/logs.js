// ============================================================
//  Consultation des logs
// ============================================================
const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getAllLogs,
  getLogById,
  createLog,
  clearLogs
} = require('../controllers/logsController');

router.use(verifyToken);

// GET    /api/logs          → Tous les logs (+ filtres query)
router.get('/',    getAllLogs);

// GET    /api/logs/:id      → Un log précis
router.get('/:id', getLogById);

// POST   /api/logs          → Enregistrer un log
router.post('/',   createLog);

// DELETE /api/logs          → Vider tous les logs
router.delete('/', clearLogs);

module.exports = router;
