import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Classe réutilisable — texte noir visible sur fond blanc
const inputClass = `w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm
  bg-white dark:bg-slate-700
  text-gray-900 dark:text-white
  placeholder-gray-400 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-blue-500`;

export default function Admins() {
  const { admin: moi } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adminEnEdition, setAdminEnEdition] = useState(null);
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState({
    nom_complet: '', email: '', mot_de_passe: '', role: 'Assistant'
  });

  useEffect(() => { chargerAdmins(); }, []);

  const chargerAdmins = async () => {
    try {
      const { data } = await api.get('/api/admins');
      setAdmins(data.admins);
    } catch {
      setAdmins([]);
    } finally {
      setChargement(false);
    }
  };

  const ouvrirModal = (admin = null) => {
    if (admin) {
      setAdminEnEdition(admin);
      setForm({
        nom_complet: admin.Nom_complet,
        email: admin.Email,
        mot_de_passe: '',
        role: admin.Role
      });
    } else {
      setAdminEnEdition(null);
      setForm({ nom_complet: '', email: '', mot_de_passe: '', role: 'Assistant' });
    }
    setShowModal(true);
    setErreur('');
  };

  const fermerModal = () => {
    setShowModal(false);
    setAdminEnEdition(null);
    setErreur('');
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.mot_de_passe) delete payload.mot_de_passe;

      if (adminEnEdition) {
        await api.put(`/api/admins/${adminEnEdition.Id_admin}`, payload);
        afficherSucces('Admin modifié avec succès.');
      } else {
        await api.post('/api/admins', payload);
        afficherSucces('Admin créé avec succès.');
      }
      fermerModal();
      chargerAdmins();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const supprimer = async (id, nom) => {
    if (!confirm(`Supprimer l'admin "${nom}" ?`)) return;
    try {
      await api.delete(`/api/admins/${id}`);
      afficherSucces('Admin supprimé.');
      chargerAdmins();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur.');
      setTimeout(() => setErreur(''), 4000);
    }
  };

  const afficherSucces = (msg) => {
    setSucces(msg);
    setTimeout(() => setSucces(''), 3000);
  };

  const badgeRole = (role) => {
    const colors = {
      'Super Admin': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      'Assistant':   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      'Modérateur':  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Admins</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Créez, modifiez ou supprimez des administrateurs.
          </p>
        </div>
        <button
          onClick={() => ouvrirModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel admin
        </button>
      </div>

      {/* Messages */}
      {succes && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
          {succes}
        </div>
      )}
      {erreur && !showModal && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {erreur}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôle</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé le</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {chargement ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">Chargement...</td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">Aucun admin trouvé.</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.Id_admin} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {admin.Nom_complet?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{admin.Nom_complet}</span>
                      {admin.Id_admin === moi?.id && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">(moi)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{admin.Email}</td>
                  <td className="px-4 py-3">{badgeRole(admin.Role)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(admin.Date_creation_admin).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => ouvrirModal(admin)}
                      className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mr-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {admin.Id_admin !== moi?.id && (
                      <button
                        onClick={() => supprimer(admin.Id_admin, admin.Nom_complet)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
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
                {adminEnEdition ? "Modifier l'admin" : 'Nouvel administrateur'}
              </h2>
              <button
                onClick={fermerModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={sauvegarder} className="px-6 py-4 space-y-4">

              {/* Erreur dans la modale */}
              {erreur && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2.5 rounded-lg text-sm">
                  {erreur}
                </div>
              )}

              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.nom_complet}
                  onChange={e => setForm({ ...form, nom_complet: e.target.value })}
                  required
                  placeholder="Ex : Jean Dupont"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="jean.dupont@example.com"
                  className={inputClass}
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe{' '}
                  {adminEnEdition
                    ? <span className="text-gray-400 dark:text-gray-500 font-normal">(laisser vide pour ne pas changer)</span>
                    : <span className="text-red-500">*</span>
                  }
                </label>
                <input
                  type="password"
                  value={form.mot_de_passe}
                  onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
                  required={!adminEnEdition}
                  placeholder={adminEnEdition ? 'Laisser vide pour ne pas modifier' : 'Minimum 6 caractères'}
                  className={inputClass}
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className={inputClass}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Assistant">Assistant</option>
                  <option value="Modérateur">Modérateur</option>
                </select>
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
                  {adminEnEdition ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}