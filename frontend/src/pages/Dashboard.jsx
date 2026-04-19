import { useState, useEffect } from 'react';
import api from '../api/axios';

// Classe réutilisable pour tous les inputs — texte TOUJOURS noir
const inputClass = `w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm
  bg-white dark:bg-slate-700
  text-gray-900 dark:text-white
  placeholder-gray-400 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-blue-500`;

export default function Dashboard() {
  const [routes, setRoutes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [routeEnEdition, setRouteEnEdition] = useState(null);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [form, setForm] = useState({
    path: '', target_url: '', methode_http: 'ALL',
    statut_route: 1, description_route: ''
  });

  useEffect(() => { chargerRoutes(); }, []);

  const chargerRoutes = async () => {
    try {
      const { data } = await api.get('/api/routes');
      setRoutes(data.routes);
    } catch {
      setErreur('Impossible de charger les routes.');
    } finally {
      setChargement(false);
    }
  };

  const ouvrirModal = (route = null) => {
    if (route) {
      setRouteEnEdition(route);
      setForm({
        path: route.Path,
        target_url: route.Target_url,
        methode_http: route.Methode_http,
        statut_route: route.Statut_route,
        description_route: route.Description_route || ''
      });
    } else {
      setRouteEnEdition(null);
      setForm({ path: '', target_url: '', methode_http: 'ALL', statut_route: 1, description_route: '' });
    }
    setShowModal(true);
    setErreur('');
  };

  const fermerModal = () => {
    setShowModal(false);
    setRouteEnEdition(null);
    setErreur('');
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    try {
      if (routeEnEdition) {
        await api.put(`/api/routes/${routeEnEdition.Id_route}`, form);
        afficherSucces('Route modifiée avec succès.');
      } else {
        await api.post('/api/routes', form);
        afficherSucces('Route créée avec succès.');
      }
      fermerModal();
      chargerRoutes();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const supprimerRoute = async (id, path) => {
    if (!confirm(`Supprimer la route "${path}" ?`)) return;
    try {
      await api.delete(`/api/routes/${id}`);
      afficherSucces('Route supprimée.');
      chargerRoutes();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const afficherSucces = (msg) => {
    setSucces(msg);
    setTimeout(() => setSucces(''), 3000);
  };

  const badgeStatut = (statut) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
      statut ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statut ? 'bg-green-500' : 'bg-gray-400'}`} />
      {statut ? 'Actif' : 'Inactif'}
    </span>
  );

  const badgeMethode = (methode) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-700', POST: 'bg-green-100 text-green-700',
      PUT: 'bg-yellow-100 text-yellow-700', DELETE: 'bg-red-100 text-red-700',
      ALL: 'bg-purple-100 text-purple-700'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors[methode] || 'bg-gray-100 text-gray-700'}`}>
        {methode}
      </span>
    );
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Table de bord</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez vos routes API et leurs destinations.</p>
        </div>
        <button
          onClick={() => ouvrirModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter route
        </button>
      </div>

      {succes && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{succes}</div>}
      {erreur && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{erreur}</div>}

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PATH</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TARGET</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">MÉTHODE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {chargement ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Chargement...</td></tr>
            ) : routes.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Aucune route. Cliquez sur "Ajouter route".</td></tr>
            ) : (
              routes.map((route) => (
                <tr key={route.Id_route} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <span className="font-mono bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">{route.Path}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{route.Target_url}</td>
                  <td className="px-4 py-3">{badgeMethode(route.Methode_http)}</td>
                  <td className="px-4 py-3">{badgeStatut(route.Statut_route)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => ouvrirModal(route)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors mr-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => supprimerRoute(route.Id_route, route.Path)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ══════ MODALE ══════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 dark:border-slate-700">
            
            {/* En-tête modale */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {routeEnEdition ? 'Modifier la route' : 'Ajouter une route'}
              </h2>
              <button onClick={fermerModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={sauvegarder} className="px-6 py-4 space-y-4">
              {erreur && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2.5 rounded-lg text-sm">
                  {erreur}
                </div>
              )}

              {/* Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Path <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.path}
                  onChange={e => setForm({ ...form, path: e.target.value })}
                  placeholder="/users"
                  required
                  className={inputClass + " font-mono"}
                />
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target URL <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.target_url}
                  onChange={e => setForm({ ...form, target_url: e.target.value })}
                  placeholder="http://localhost:3001"
                  required
                  className={inputClass + " font-mono"}
                />
              </div>

              {/* Méthode + Statut */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Méthode</label>
                  <select
                    value={form.methode_http}
                    onChange={e => setForm({ ...form, methode_http: e.target.value })}
                    className={inputClass}
                  >
                    {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select
                    value={form.statut_route}
                    onChange={e => setForm({ ...form, statut_route: parseInt(e.target.value) })}
                    className={inputClass}
                  >
                    <option value={1}>Actif</option>
                    <option value={0}>Inactif</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  value={form.description_route}
                  onChange={e => setForm({ ...form, description_route: e.target.value })}
                  placeholder="Description optionnelle"
                  className={inputClass}
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fermerModal}
                  className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {routeEnEdition ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}