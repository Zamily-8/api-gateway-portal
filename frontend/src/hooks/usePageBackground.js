import { useLocation } from 'react-router-dom';

// Chaque page a sa propre image, choisie pour coller au thème API/tech/admin
const PAGE_BACKGROUNDS = {
  '/login': {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=85&fit=crop',
    label: 'Serveurs datacenter',
    overlay: 'bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80',
  },
  '/': {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=85&fit=crop',
    label: 'Réseau mondial',
    overlay: 'bg-gradient-to-br from-slate-900/70 via-indigo-900/50 to-slate-900/70',
  },
  '/logs': {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=85&fit=crop',
    label: 'Code matrix',
    overlay: 'bg-gradient-to-br from-slate-900/75 via-emerald-900/50 to-slate-900/75',
  },
  '/profil': {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=85&fit=crop',
    label: 'Technologie futuriste',
    overlay: 'bg-gradient-to-br from-slate-900/70 via-violet-900/50 to-slate-900/70',
  },
  '/parametres': {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85&fit=crop',
    label: 'Circuits électroniques',
    overlay: 'bg-gradient-to-br from-slate-900/75 via-slate-800/60 to-slate-900/75',
  },
  '/admins': {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&q=85&fit=crop',
    label: 'Administration sécurisée',
    overlay: 'bg-gradient-to-br from-slate-900/75 via-amber-900/40 to-slate-900/75',
  },
};

// Image par défaut si la page n'est pas reconnue
const DEFAULT_BG = {
  url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1920&q=85&fit=crop',
  label: 'Technologie',
  overlay: 'bg-gradient-to-br from-slate-900/70 via-blue-900/50 to-slate-900/70',
};

export function usePageBackground() {
  const { pathname } = useLocation();
  return PAGE_BACKGROUNDS[pathname] || DEFAULT_BG;
}