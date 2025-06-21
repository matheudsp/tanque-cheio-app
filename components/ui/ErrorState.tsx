import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.feedbackContainer}>
    <Feather name="alert-circle" size={60} color={colors.error} />

    <Text style={styles.feedbackTitle}>Erro ao Carregar</Text>

    <Text style={styles.feedbackSubtitle}>
      Não foi possível buscar seus dados. Verifique sua conexão e tente
      novamente.
    </Text>

    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Tentar Novamente</Text>
    </TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  feedbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 24,
    textAlign: "center",
  },
  feedbackSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: { color: colors.white, fontWeight: "bold", fontSize: 16 },
});
