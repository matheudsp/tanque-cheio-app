import { Star } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export const PremiumBadge = () => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={styles.premiumBadge}>
      <Star
        size={12}
        color={themeState.colors.secondary.text}
        style={styles.premiumBadgeIcon}
      />
      <Text style={styles.premiumBadgeText}>PREMIUM</Text>
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.secondary.main,
      borderRadius: theme.borderRadius.small,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    premiumBadgeIcon: {
      marginRight: theme.spacing.xs,
    },
    premiumBadgeText: {
      color: theme.colors.secondary.text,
      fontSize: 10,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
