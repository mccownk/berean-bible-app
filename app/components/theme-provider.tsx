"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Custom hook for theme management with sepia support
export function useCustomTheme() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<string>('light');
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Sync current theme with next-themes and DOM state
  React.useEffect(() => {
    if (!mounted) return;
    
    if (document?.documentElement?.classList?.contains('theme-sepia')) {
      setCurrentTheme('sepia');
    } else {
      setCurrentTheme(theme || systemTheme || 'light');
    }
  }, [theme, systemTheme, mounted]);

  const applyTheme = React.useCallback((newTheme: string) => {
    if (!mounted) return;
    
    // Update local state immediately
    setCurrentTheme(newTheme);
    
    // Handle sepia theme as a special case
    if (newTheme === 'sepia') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('theme-sepia');
      setTheme('light'); // Use light as base for sepia
    } else {
      document.documentElement.classList.remove('theme-sepia');
      setTheme(newTheme);
    }
  }, [setTheme, mounted]);

  return {
    theme: currentTheme,
    setTheme: applyTheme,
    systemTheme,
    mounted
  };
}
