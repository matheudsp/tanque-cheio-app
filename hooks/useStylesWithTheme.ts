import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "@/providers/themeProvider";
import { NamedStyles, ThemeState } from "@/types/theme";

const useStylesWithTheme = <T extends NamedStyles<T>>(
  builderFn: (theme: ThemeState) => T
): T => {
  const { themeState: currentTheme } = useTheme();

  // useMemo garante que os estilos só sejam recalculados se o tema mudar.
  return useMemo(() => {
    const styles = builderFn(currentTheme);
    return StyleSheet.create(styles) as T;
  }, [builderFn, currentTheme]);
};

export { useStylesWithTheme };
