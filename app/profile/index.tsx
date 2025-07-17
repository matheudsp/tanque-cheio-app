import { Mail, User, AlertCircle } from "lucide-react-native";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { useUserStore } from "@/stores/userStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import { Button } from "@/components/Button";

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
}) => {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  return (
    <View style={styles.infoItem}>
      <Icon size={20} color={themeState.colors.primary.main} />
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Não informado"}</Text>
      </View>
    </View>
  );
};

export default function PersonalInfoScreen() {
  const { user, isLoading, error, fetchCurrentUser } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
      error: state.error,
      fetchCurrentUser: state.fetchCurrentUser,
    }))
  );

  const styles = useStylesWithTheme(getStyles);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const renderContent = () => {
    if (isLoading && !user) {
      return (
        <ActivityIndicator
          size="large"
          color={styles.loadingColor.color}
          style={styles.centered}
        />
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <AlertCircle size={40} color={styles.errorText.color} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Tentar Novamente"
            onPress={fetchCurrentUser}
            variant="outline"
          />
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Nenhum usuário encontrado.</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <InfoRow icon={User} label="Nome" value={user.name} />
          <InfoRow icon={Mail} label="E-mail" value={user.email} />
          <InfoRow
            label="Acessos via"
            value={user.provider.toLocaleUpperCase()}
            icon={AlertCircle}
          />
          <InfoRow
            label="Criado em"
            value={new Date(user.created_at).toLocaleDateString("pt-BR")}
            icon={AlertCircle}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen
        options={{
          title: "Meu Perfil",
          headerBackTitle: "Voltar",
        }}
      />
      {renderContent()}
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingColor: {
      color: theme.colors.primary.main,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 16,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.lg,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    infoContent: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    label: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
