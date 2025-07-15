import { Globe, Moon, Sun } from "lucide-react-native";
import { Stack } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { ThemePreference, type ThemeState } from "@/types/theme";

const ThemeOptionButton = ({
  label,
  onPress,
  isActive,
}: {
  label: string;
  onPress: () => void;
  isActive: boolean;
}) => {
  const styles = useStylesWithTheme(getStyles);
  return (
    <TouchableOpacity
      style={[styles.optionButton, isActive && styles.optionButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function PreferencesScreen() {
  const styles = useStylesWithTheme(getStyles);
  const { themeState, themePreference, setTheme } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={["bottom","top"]}>
      <Stack.Screen
        options={{
          title: "Preferências",
          headerBackTitle: "Voltar",
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Moon size={20} color={themeState.colors.primary.main} />
              <Text style={styles.preferenceTitle}>Aparência</Text>
            </View>
            <View style={styles.optionsContainer}>
              <ThemeOptionButton
                label="Claro"
                isActive={themePreference === ThemePreference.LIGHT}
                onPress={() => setTheme(ThemePreference.LIGHT)}
              />
              <ThemeOptionButton
                label="Escuro"
                isActive={themePreference === ThemePreference.DARK}
                onPress={() => setTheme(ThemePreference.DARK)}
              />
              <ThemeOptionButton
                label="Sistema"
                isActive={themePreference === ThemePreference.SYSTEM}
                onPress={() => setTheme(ThemePreference.SYSTEM)}
              />
            </View>
          </View>
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
      paddingVertical: theme.spacing.sm,
    },
    preferenceItem: {
      paddingVertical: theme.spacing.md,
    },
    preferenceInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    preferenceTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
    },
    optionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.colors.background.default,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.xs,
    },
    optionButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.small,
      alignItems: "center",
      justifyContent: "center",
    },
    optionButtonActive: {
      backgroundColor: theme.colors.background.paper,
      ...theme.shadows.shadowSm,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    optionTextActive: {
      color: theme.colors.primary.main,
    },
  });
