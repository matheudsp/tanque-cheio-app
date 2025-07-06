import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/userStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { ThemeState } from "@/types/theme";
import { Stack, useRouter } from "expo-router";

type StateDisplayProps = {
  title: string;
  data: unknown;
  style: Record<string, any>;
};

const StateDisplay: React.FC<StateDisplayProps> = ({ title, data, style }) => (
  <View style={style.stateContainer}>
    <Text style={style.stateTitle}>{title}</Text>
    <ScrollView style={style.stateScrollView} nestedScrollEnabled>
      <Text style={style.stateContent}>{JSON.stringify(data, null, 2)}</Text>
    </ScrollView>
  </View>
);

export default function DeveloperScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);

  const storeState = useUserStore.getState();

  const { togglePremiumStatus, isPremium } = useUserStore();

  const handleTogglePremium = () => {
    togglePremiumStatus();
    router.replace("/dev/developer" as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Developer Menu</Text>
        <Text style={styles.headerSubtitle}>
          Dados armazenados e ações de depuração.
        </Text>

        {/* Exibição dos dados da store */}
        <StateDisplay
          title="User State"
          data={storeState.user}
          style={styles}
        />
        <StateDisplay
          title="Authentication State"
          data={{
            isAuthenticated: storeState.isAuthenticated,
            isPremium: storeState.isPremium,
          }}
          style={styles}
        />

        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Ações</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTogglePremium}
          >
            <Text style={styles.actionButtonText}>
              {isPremium ? "Desativar" : "Ativar"} Premium
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xl,
    },
    stateContainer: {
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.md,
    },
    stateTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    stateScrollView: {
      maxHeight: 200,
      backgroundColor: theme.colors.background.paper,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.small,
    },
    stateContent: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    actionsContainer: {
      marginTop: theme.spacing.md,
    },
    actionsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    actionButton: {
      backgroundColor: theme.colors.primary.main,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
      alignItems: "center",
    },
    actionButtonText: {
      color: theme.colors.primary.text,
      fontSize: 16,
      fontWeight: "bold",
    },
  });
