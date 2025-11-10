import { createContext, useContext } from 'react';

interface ThemeContextValue {
  isLightTheme: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemePreference = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemePreference must be used within a ThemeContext.Provider');
  }

  return context;
};
