import { Feather } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  return (
    <View style={styles.feedbackContainer}>
      <Feather name="alert-circle" size={60} color={themeState.colors.error} />

      <Text style={styles.feedbackTitle}>Erro ao Carregar</Text>

      <Text style={styles.feedbackSubtitle}>
        Não foi possível buscar seus dados. Verifique sua conexão e tente
        novamente.
      </Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
});

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    feedbackContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.default,
    },
    feedbackTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      textAlign: "center",
    },
    feedbackSubtitle: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginTop: theme.spacing.sm,
      lineHeight: theme.typography.lineHeight.body,
    },
    retryButton: {
      marginTop: theme.spacing.xl,
      backgroundColor: theme.colors.button.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing["2xl"],
      borderRadius: theme.borderRadius.round,
    },
    retryButtonText: {
      color: theme.colors.primary.text,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.medium,
    },
  });
