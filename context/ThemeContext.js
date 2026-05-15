import React, { createContext, useContext, useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

const light = {
  background: '#f0f2f8',
  surface: '#ffffff',
  surfaceElevated: '#f8f8ff',
  text: '#1a1a2e',
  subtext: '#6b6b8a',
  border: '#e4e4ee',
  primary: '#6c5ce7',
  primaryLight: '#a29bfe',
  present: '#00b894',
  absent: '#ff6b6b',
  presentBg: '#e6faf5',
  absentBg: '#fff0f0',
  tabBar: '#ffffff',
  tabBarBorder: '#e4e4ee',
  statusBar: 'dark',
  cardShadow: '#000000',
  headerBg: '#ffffff',
  headerText: '#1a1a2e',
};

const dark = {
  background: '#0d0d1a',
  surface: '#1a1a2e',
  surfaceElevated: '#232344',
  text: '#e8e8f0',
  subtext: '#8888aa',
  border: '#2a2a4a',
  primary: '#7c6cf0',
  primaryLight: '#a29bfe',
  present: '#00cec9',
  absent: '#ff6b6b',
  presentBg: '#0d2b28',
  absentBg: '#2d1414',
  tabBar: '#1a1a2e',
  tabBarBorder: '#2a2a4a',
  statusBar: 'light',
  cardShadow: '#000000',
  headerBg: '#1a1a2e',
  headerText: '#e8e8f0',
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
