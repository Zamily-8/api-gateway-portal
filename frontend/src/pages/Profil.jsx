import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Classe réutilisable — texte noir visible sur fond blanc
const inputClass = `w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm
  bg-white dark:bg-slate-700
  text-gray-900 dark:text-white
  placeholder-gray-400 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-blue-500`;

const inputDisabled = `w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm
  bg-gray-50 dark:bg-slate-800
  text-gray-500 dark:text-gray-400
  cursor-not-allowed`;

export default function Profil() {
  const { admin: adminContext } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState({ nom_complet: '', email: '' });
  const [motsDePasse, setMotsDePasse] = useState({
    mot_de_passe_actuel: '', nouveau_mot_de_passe: '', confirmer: ''
  });
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (adminContext?.id) {
      api.get(`/api/admins/${adminContext.id}`).then(({ data }) => {
        setAdmin(data.admin);
        setForm({ nom_complet: data.admin.Nom_complet, email: data.admin.Email });
      });
    }
  }, [adminContext]);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setErreur('');

    if (motsDePasse.nouveau_mot_de_passe && motsDePasse.nouveau_mot_de_passe !== motsDePasse.confirmer) {
      return setErreur('Les nouveaux mots de passe ne correspondent pas.');
    }

    setChargement(true);
    try {
      const payload = { ...form };
      if (motsDePasse.nouveau_mot_de_passe) {
        payload.mot_de_passe_actuel = motsDePasse.mot_de_passe_actuel;
        payload.nouveau_mot_de_passe = motsDePasse.nouveau_mot_de_passe;
      }
      await api.put('/api/auth/profil', payload);
      setSucces('Profil mis à jour avec succès.');
      setMotsDePasse({ mot_de_passe_actuel: '', nouveau_mot_de_passe: '', confirmer: '' });
      setTimeout(() => setSucces(''), 3000);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setChargement(false);
    }
  };

  if (!admin) return (
    <div className="text-center py-10 text-gray-400 dark:text-gray-500">Chargement...</div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 max-w-2xl">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {admin.Nom_complet?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{admin.Nom_complet}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{admin.Role}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ACCÈS COMPLET
            </span>
          </div>
        </div>

        {/* Messages */}
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

        <form onSubmit={sauvegarder} className="space-y-4">

          {/* Nom + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom complet
              </label>
              <input
                value={form.nom_complet}
                onChange={e => setForm({ ...form, nom_complet: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Rôle (lecture seule) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle (lecture seule)
            </label>
            <input
              value={admin.Role}
              disabled
              className={inputDisabled}
            />
          </div>

          {/* Section Sécurité */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Sécurité</h3>
            <div className="space-y-3">

              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={motsDePasse.mot_de_passe_actuel}
                  onChange={e => setMotsDePasse({ ...motsDePasse, mot_de_passe_actuel: e.target.value })}
                  placeholder="Entrez votre mot de passe actuel"
                  className={inputClass}
                />
              </div>

              {/* Nouveau + Confirmer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={motsDePasse.nouveau_mot_de_passe}
                    onChange={e => setMotsDePasse({ ...motsDePasse, nouveau_mot_de_passe: e.target.value })}
                    placeholder="Laisser vide pour ne pas modifier"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmer le nouveau
                  </label>
                  <input
                    type="password"
                    value={motsDePasse.confirmer}
                    onChange={e => setMotsDePasse({ ...motsDePasse, confirmer: e.target.value })}
                    placeholder="Confirmer"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={chargement}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}