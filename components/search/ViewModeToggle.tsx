import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { List, Map } from "lucide-react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";

interface ViewModeToggleProps {
  viewMode: "list" | "map";
  onViewModeChange: (mode: "list" | "map") => void;
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const getButtonStyle = (mode: "list" | "map") => [
    styles.button,
    viewMode === mode && styles.activeButton,
  ];

  const getTextStyle = (mode: "list" | "map") => [
    styles.buttonText,
    viewMode === mode && styles.activeButtonText,
  ];

  const getIconColor = (mode: "list" | "map") =>
    viewMode === mode
      ? themeState.colors.primary.main
      : themeState.colors.text.secondary;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle("list")}
        onPress={() => onViewModeChange("list")}
      >
        <List color={getIconColor("list")} size={16} />
        <Text style={getTextStyle("list")}>Lista</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={getButtonStyle("map")}
        onPress={() => onViewModeChange("map")}
      >
        <Map color={getIconColor("map")} size={16} />
        <Text style={getTextStyle("map")}>Mapa</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.background.default,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.xs,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
    },
    activeButton: {
      backgroundColor: theme.colors.action.selected,
      ...theme.shadows.shadowSm,
    },
    buttonText: {
      marginLeft: theme.spacing.sm,
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
    },
    activeButtonText: {
      color: theme.colors.primary.main,
    },
  });
