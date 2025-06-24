import React from "react";
import { View, StyleSheet } from "react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export const ChartSkeleton = () => {
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={styles.container}>
      <View style={styles.chartArea} />
      <View style={styles.labelContainer}>
        <View style={styles.labelPill} />
        <View style={styles.labelPill} />
        <View style={styles.labelPill} />
        <View style={styles.labelPill} />
      </View>
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
    },
    chartArea: {
      height: 180,
      backgroundColor: theme.colors.divider,
      borderRadius: theme.borderRadius.medium,
      marginBottom: theme.spacing.lg,
    },
    labelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    labelPill: {
      height: 20,
      width: "20%",
      backgroundColor: theme.colors.divider,
      borderRadius: theme.borderRadius.medium,
    },
  });
