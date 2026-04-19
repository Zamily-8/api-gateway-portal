// ============================================================
//  Vérification du token JWT
//  Ce middleware protège toutes les routes privées.
//  Il vérifie que le client envoie un token valide
//  dans l'en-tête Authorization : Bearer <token>
// ============================================================
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  // 1. Récupérer l'en-tête Authorization
  const authHeader = req.headers['authorization'];

  // 2. Vérifier que l'en-tête existe et commence par "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Token manquant ou mal formaté.'
    });
  }

  // 3. Extraire le token (après "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 4. Vérifier et décoder le token avec le secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attacher les infos de l'admin à la requête pour la suite
    req.admin = decoded;

    // 6. Passer au prochain middleware ou à la route
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token invalide.'
    });
  }
};

module.exports = verifyToken;
