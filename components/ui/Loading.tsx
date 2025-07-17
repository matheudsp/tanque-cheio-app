import { ActivityIndicator, StyleSheet, View } from "react-native";
import React from "react";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
interface LoadingProps {
  size?: "small" | "large";
}
export const Loading = ({ size = "large" }: LoadingProps) => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={themeState.colors.secondary.main} />
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
