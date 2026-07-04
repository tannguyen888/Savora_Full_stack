import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { applyTheme, ThemeMode } from "@/lib/design";

const THEME_KEY = "savora_theme";

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

async function persistTheme(mode: ThemeMode) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(THEME_KEY, mode);
    return;
  }
  await AsyncStorage.setItem(THEME_KEY, mode);
}

async function readStoredTheme(): Promise<ThemeMode | null> {
  if (Platform.OS === "web") {
    const value = globalThis.localStorage?.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  }
  const value = await AsyncStorage.getItem(THEME_KEY);
  return value === "dark" || value === "light" ? value : null;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const stored = await readStoredTheme();
      if (!mounted) return;
      const next = stored ?? "light";
      setModeState(next);
      applyTheme(next);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<ThemeContextType>(() => {
    return {
      mode,
      isDark: mode === "dark",
      setMode: async (next) => {
        setModeState(next);
        applyTheme(next);
        await persistTheme(next);
      },
      toggleTheme: async () => {
        const next = mode === "dark" ? "light" : "dark";
        setModeState(next);
        applyTheme(next);
        await persistTheme(next);
      }
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeProvider");
  return ctx;
}
