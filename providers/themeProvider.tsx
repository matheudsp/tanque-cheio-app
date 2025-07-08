import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Appearance,
  ColorSchemeName,
  StatusBar,
  useColorScheme,
} from "react-native";

import { DARK_THEME, LIGHT_THEME } from "@/constants/themes";
import { Theme, ThemePreference, ThemeState } from "@/types/theme";
import { storage } from "@/lib/mmkv";

const THEME_STORAGE_KEY = "@app_theme";

interface ThemeContextProps {
  themeState: ThemeState;
  setTheme: (preference: ThemePreference) => void;
  isLoading: boolean;
  themePreference: ThemePreference;
}

type ThemeProviderProps = {
  children: ReactNode;
  defaultThemePreference?: ThemePreference;
  onThemeLoaded: () => void;
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

function useThemeStorage() {
  const saveThemePreference = async (
    preference: ThemePreference
  ): Promise<void> => {
    storage.set(THEME_STORAGE_KEY, preference);
  };

  const loadThemePreference = async (): Promise<ThemePreference | null> => {
    const value = storage.getString(THEME_STORAGE_KEY);
    return (value as ThemePreference) ?? null;
  };

  return { saveThemePreference, loadThemePreference };
}

const resolveTheme = (
  preference: ThemePreference,
  systemTheme: ColorSchemeName
): Theme => {
  if (preference === ThemePreference.SYSTEM) {
    return systemTheme === "dark" ? Theme.DARK : Theme.LIGHT;
  }
  return preference === ThemePreference.DARK ? Theme.DARK : Theme.LIGHT;
};

const themeMap: Record<Theme, ThemeState> = {
  [Theme.LIGHT]: LIGHT_THEME,
  [Theme.DARK]: DARK_THEME,
};

export const ThemeProvider = ({
  children,
  onThemeLoaded,
  defaultThemePreference = ThemePreference.SYSTEM,
}: ThemeProviderProps) => {
  const systemColorScheme = useColorScheme();
  const { saveThemePreference, loadThemePreference } = useThemeStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [colorScheme, setColorScheme] =
    useState<ColorSchemeName>(systemColorScheme);
  const [userThemePreference, setUserThemePreference] =
    useState<ThemePreference>(defaultThemePreference);
  const [activeTheme, setActiveTheme] = useState<Theme>(
    resolveTheme(defaultThemePreference, colorScheme)
  );

  const setTheme = async (preference: ThemePreference) => {
    setUserThemePreference(preference);
    await saveThemePreference(preference);
  };

  useEffect(() => {
    setActiveTheme(resolveTheme(userThemePreference, colorScheme));
  }, [userThemePreference, colorScheme]);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedPreference = await loadThemePreference();
        if (savedPreference) {
          setUserThemePreference(savedPreference);
        }
      } finally {
        setIsLoading(false);
        onThemeLoaded?.();
      }
    };
    initializeTheme();
  }, [loadThemePreference, onThemeLoaded]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme: newColorScheme }) => {
        setColorScheme(newColorScheme);
      }
    );
    return () => subscription.remove();
  }, []);

  const currentThemeState = themeMap[activeTheme];

  return (
    <ThemeContext.Provider
      value={{
        themeState: currentThemeState,
        setTheme,
        isLoading,
        themePreference: userThemePreference,
      }}
    >
      <StatusBar
        barStyle={activeTheme === Theme.DARK ? "light-content" : "dark-content"}
        backgroundColor={currentThemeState.colors.background.default}
        translucent={false}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
