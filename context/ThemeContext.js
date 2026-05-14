import React, { createContext, useContext, useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

const light = {
  background: '#f0f2f5',
  surface: '#fff',
  text: '#1a1a2e',
  subtext: '#666',
  border: '#e0e0e0',
  primary: '#1a1a2e',
  primaryLight: '#2d2d5e',
  present: '#4caf50',
  absent: '#f44336',
  presentBg: '#e8f5e9',
  absentBg: '#fce4ec',
  tabBar: '#fff',
  tabBarBorder: '#e0e0e0',
  statusBar: 'dark',
};

const dark = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#e0e0e0',
  subtext: '#999',
  border: '#333',
  primary: '#bb86fc',
  primaryLight: '#9c64e0',
  present: '#4caf50',
  absent: '#cf6679',
  presentBg: '#1b3d1b',
  absentBg: '#3d1b1b',
  tabBar: '#1e1e1e',
  tabBarBorder: '#333',
  statusBar: 'light',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const themePath = FileSystem.documentDirectory + 'theme.json';

  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(themePath);
        if (info.exists) {
          const content = await FileSystem.readAsStringAsync(themePath);
          const { isDark } = JSON.parse(content);
          setIsDark(isDark);
        }
      } catch {}
    })();
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      FileSystem.writeAsStringAsync(themePath, JSON.stringify({ isDark: next })).catch(() => {});
      return next;
    });
  }

  const colors = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
