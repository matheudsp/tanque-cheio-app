import { Mail, User } from "lucide-react-native";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserStore } from "@/stores/userStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function PersonalInfoScreen() {
  const { user } = useUserStore();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Informações Pessoais",
          headerBackTitle: "Voltar",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <View style={styles.infoItem}>
            <User size={20} color={themeState.colors.primary.main} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{user?.name || "Não definido"}</Text>
            </View>
          </View>

          <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
            <Mail size={20} color={themeState.colors.primary.main} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.value}>{user?.email || "Não definido"}</Text>
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
