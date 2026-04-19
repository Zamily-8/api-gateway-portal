import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Lire le thème sauvegardé, ou "système" par défaut
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'système'
  );

  // Chaque fois que le thème change, on met à jour <html>
  useEffect(() => {
    const root = document.documentElement; // = <html>

    if (theme === 'sombre') {
      root.classList.add('dark');
    } else if (theme === 'clair') {
      root.classList.remove('dark');
    } else {
      // "système" : on suit la préférence de l'OS
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Sauvegarder le choix localement
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Écouter les changements de l'OS quand le thème est "système"
  useEffect(() => {
    if (theme !== 'système') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const root = document.documentElement;
      if (e.matches) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}