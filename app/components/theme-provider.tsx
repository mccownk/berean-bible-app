"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Simplified custom hook for theme management with sepia support
export function useCustomTheme() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme with proper sepia handling
  const applyTheme = React.useCallback((newTheme: string) => {
    if (!mounted) return;
    
    // Clean up any existing theme classes
    document.documentElement.classList.remove('theme-sepia');
    
    if (newTheme === 'sepia') {
      // For sepia, add custom class and set next-themes to light
      document.documentElement.classList.add('theme-sepia');
      setTheme('light');
    } else {
      // For light/dark, use next-themes normally
      setTheme(newTheme);
    }
  }, [setTheme, mounted]);

  // Get current effective theme
  const getCurrentTheme = React.useCallback(() => {
    if (!mounted) return 'light';
    
    if (document.documentElement.classList.contains('theme-sepia')) {
      return 'sepia';
    }
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  }, [mounted]);

  return {
    theme: getCurrentTheme(),
    setTheme: applyTheme,
    systemTheme,
    mounted
  };
}
