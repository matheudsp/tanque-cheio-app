import { ActivityIndicator, StyleSheet, View } from "react-native";
import React from "react";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export const Loading = () => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={themeState.colors.secondary.main}
      />
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background.default,
    },
  });
