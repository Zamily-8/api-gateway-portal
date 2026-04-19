import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';

export default function Parametres() {
  const { theme, setTheme } = useTheme();
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargementJWT, setChargementJWT] = useState(false);
  const [chargementPurge, setChargementPurge] = useState(false);

  const afficherSucces = (msg) => {
    setSucces(msg); setErreur('');
    setTimeout(() => setSucces(''), 4000);
  };
  const afficherErreur = (msg) => {
    setErreur(msg); setSucces('');
  };

  const changerTheme = async (nouveauTheme) => {
    // 1. Appliquer immédiatement via le contexte (change <html class>)
    setTheme(nouveauTheme);

    // 2. Sauvegarder en base de données
    try {
      await api.put('/api/parametres', { theme: nouveauTheme });
      afficherSucces(`Thème "${nouveauTheme}" appliqué.`);
    } catch {
      afficherErreur('Erreur lors de la sauvegarde du thème.');
    }
  };

  const purgerCache = async () => {
    setChargementPurge(true);
    try {
      const { data } = await api.post('/api/parametres/purge');
      afficherSucces(data.message);
    } catch { afficherErreur('Erreur lors de la purge.'); }
    finally { setChargementPurge(false); }
  };

  const genererJWT = async () => {
    if (!confirm('Générer un nouveau secret JWT ? Tous les utilisateurs devront se reconnecter.')) return;
    setChargementJWT(true);
    try {
      const { data } = await api.post('/api/parametres/generer-jwt');
      afficherSucces(`${data.message} Aperçu : ${data.apercu}`);
    } catch { afficherErreur('Erreur lors de la génération.'); }
    finally { setChargementJWT(false); }
  };

  const themes = [
    { id: 'clair',   label: 'Clair',   icon: '☀️', desc: 'Toujours clair' },
    { id: 'sombre',  label: 'Sombre',  icon: '🌙', desc: 'Toujours sombre' },
    { id: 'système', label: 'Système', icon: '💻', desc: 'Suit l\'OS' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configurez l'interface et les options générales du système.
        </p>
      </div>

      {succes && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
          {succes}
        </div>
      )}
      {erreur && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {erreur}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Apparence */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌙</span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Apparence</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Choisissez le thème de l'interface d'administration.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ id, label, icon, desc }) => (
              <button
                key={id}
                onClick={() => changerTheme(id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  theme === id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                <span className="text-2xl">{icon}</span>
                <span>{label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions Système */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛡️</span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Actions Système</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Purger le cache</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Force la mise à jour depuis MySQL.</p>
              </div>
              <button
                onClick={purgerCache}
                disabled={chargementPurge}
                className="px-4 py-2 border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-white dark:hover:bg-slate-600 disabled:opacity-50 transition-colors font-medium"
              >
                {chargementPurge ? '...' : 'Purger'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">🔑 Clé JWT</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Générer un nouveau secret.</p>
              </div>
              <button
                onClick={genererJWT}
                disabled={chargementJWT}
                className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors font-medium"
              >
                {chargementJWT ? '...' : 'Générer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}