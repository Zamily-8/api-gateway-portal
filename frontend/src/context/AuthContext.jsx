import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// 1. Créer le contexte (la "boîte" qui contient les données globales)
const AuthContext = createContext(null);

// 2. Le Provider enveloppe toute l'application et partage les données
export function AuthProvider({ children }) {
  // Lire le token et l'admin sauvegardés (si l'utilisateur était déjà connecté)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [admin, setAdmin] = useState(
    JSON.parse(localStorage.getItem('admin') || 'null')
  );
  const navigate = useNavigate();

  // Fonction de connexion : appelle l'API et sauvegarde le token
  const login = async (email, mot_de_passe) => {
    const response = await api.post('/api/auth/login', { email, mot_de_passe });
    const { token: newToken, admin: adminData } = response.data;

    // Sauvegarder dans le localStorage (persiste après fermeture du navigateur)
    localStorage.setItem('token', newToken);
    localStorage.setItem('admin', JSON.stringify(adminData));

    setToken(newToken);
    setAdmin(adminData);

    // Rediriger vers le tableau de bord
    navigate('/');
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
    navigate('/login');
  };

  // Ce qui est partagé avec toute l'application
  const value = {
    token,
    admin,
    login,
    logout,
    isAuthenticated: !!token,
    isSuperAdmin: admin?.role === 'Super Admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Hook personnalisé pour utiliser le contexte facilement
export function useAuth() {
  return useContext(AuthContext);
}