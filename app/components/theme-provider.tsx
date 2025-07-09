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
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const applyTheme = React.useCallback((newTheme: string) => {
    if (!mounted) return;
    
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

  const currentTheme = React.useMemo(() => {
    if (!mounted) return 'light';
    
    if (document?.documentElement?.classList?.contains('theme-sepia')) {
      return 'sepia';
    }
    return theme || systemTheme || 'light';
  }, [theme, systemTheme, mounted]);

  return {
    theme: currentTheme,
    setTheme: applyTheme,
    systemTheme,
    mounted
  };
}
