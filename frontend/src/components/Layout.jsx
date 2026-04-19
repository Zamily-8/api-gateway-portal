import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageBackground from './PageBackground';

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  logs: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  profil: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  admins: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

export default function Layout() {
  const { admin, logout, isSuperAdmin } = useAuth();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
        : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Image de fond dynamique par page */}
      <PageBackground />

      {/* ── SIDEBAR ── */}
      <aside className="relative z-10 w-60 flex flex-col
        bg-white/80 dark:bg-slate-900/80
        backdrop-blur-xl
        border-r border-white/30 dark:border-slate-700/50">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/30 dark:border-slate-700/50">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">API Gateway</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink to="/" end className={navClass}>
            {icons.dashboard}
            <span>Table de bord</span>
          </NavLink>
          <NavLink to="/logs" className={navClass}>
            {icons.logs}
            <span>Logs</span>
          </NavLink>
          <NavLink to="/profil" className={navClass}>
            {icons.profil}
            <span>Profil Admin</span>
          </NavLink>
          <NavLink to="/parametres" className={navClass}>
            {icons.settings}
            <span>Paramètres</span>
          </NavLink>
          {isSuperAdmin && (
            <NavLink to="/admins" className={navClass}>
              {icons.admins}
              <span>Gestion Admins</span>
            </NavLink>
          )}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-white/30 dark:border-slate-700/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            {icons.logout}
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">

        {/* Navbar */}
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/30 dark:border-slate-700/50 px-6 py-3 flex items-center justify-end gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">{admin?.nom_complet}</span>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-semibold">
              {admin?.nom_complet?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
            {admin?.role}
          </span>
        </header>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto p-6">
          {/* Carte semi-transparente qui enveloppe le contenu de la page */}
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-lg rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-xl p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}