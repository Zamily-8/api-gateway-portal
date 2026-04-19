import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [succes, setSucces] = useState('');

  useEffect(() => { chargerLogs(); }, []);

  const chargerLogs = async (search = '') => {
    setChargement(true);
    try {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/api/logs${params}`);
      setLogs(data.logs);
    } catch {
      setLogs([]);
    } finally {
      setChargement(false);
    }
  };

  const viderLogs = async () => {
    if (!confirm('Vider tous les logs ?')) return;
    await api.delete('/api/logs');
    setSucces('Logs vidés.');
    setTimeout(() => setSucces(''), 3000);
    chargerLogs();
  };

  const badgeStatut = (code) => {
    let cls = 'bg-gray-100 text-gray-700';
    if (code >= 200 && code < 300) cls = 'bg-green-100 text-green-700';
    else if (code >= 400 && code < 500) cls = 'bg-yellow-100 text-yellow-700';
    else if (code >= 500) cls = 'bg-red-100 text-red-700';
    return <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${cls}`}>{code}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Requêtes</h1>
          <p className="text-sm text-gray-500 mt-1">Historique d'accès centralisé via MySQL.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={recherche} onChange={e => setRecherche(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && chargerLogs(recherche)}
              placeholder="Rechercher une route..."
              className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-56" />
          </div>
          <button onClick={() => chargerLogs(recherche)} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button onClick={viderLogs} className="text-sm px-3 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            Vider
          </button>
        </div>
      </div>

      {succes && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{succes}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ROUTE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MÉTHODE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">TEMPS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chargement ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Chargement...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Aucun log trouvé.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.Id_log} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">{log.route_path}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-blue-600">{log.Methode_log}</span>
                  </td>
                  <td className="px-4 py-3">{badgeStatut(log.Code_statut)}</td>
                  <td className="px-4 py-3 text-gray-600">{log.Temps_reponse_ms}ms</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(log.Date_heure).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}