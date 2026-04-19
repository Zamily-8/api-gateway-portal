// ============================================================
//  server.js — Point d'entrée principal du backend
//  API Gateway — Node.js / Express / MySQL
//  Mise à jour : ajout de la route /api/admins
// ============================================================
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
require('dotenv').config();

const app = express();

// ─── MIDDLEWARES GLOBAUX ─────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── ROUTES ──────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/admins',     require('./routes/admins'));      // ← NOUVEAU
app.use('/api/routes',     require('./routes/routes'));
app.use('/api/logs',       require('./routes/logs'));
app.use('/api/parametres', require('./routes/parametres'));

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:   true,
    message:   'API Gateway Backend opérationnel ✅',
    version:   '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.method} ${req.originalUrl}`
  });
});

// ─── ERREUR GLOBALE ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur non gérée :', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message })
  });
});

// ─── DÉMARRAGE ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║      API GATEWAY — BACKEND DÉMARRÉ        ║');
  console.log(`║   Serveur actif sur http://localhost:${PORT}  ║`);
  console.log(`║   Environnement : ${process.env.NODE_ENV || 'development'}               ║`);
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
