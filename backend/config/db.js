// ============================================================
// Connexion à la base de données MySQL
// ============================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

// Création du pool de connexions
// Un pool gère plusieurs connexions simultanées automatiquement
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'api_gateway_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone: '+00:00',
});

// Test de connexion au démarrage
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅  Connexion MySQL réussie — Base :', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌  Erreur de connexion MySQL :', error.message);
    process.exit(1); // Arrêt si la DB est inaccessible
  }
}

testConnection();

module.exports = pool;
