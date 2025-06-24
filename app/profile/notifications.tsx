import { AlertCircle, Bell } from "lucide-react-native";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function NotificationsScreen() {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  const [promotions, setPromotions] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Notificações",
          headerBackTitle: "Voltar",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Bell size={24} color={themeState.colors.primary.main} />
              <View style={styles.notificationDetails}>
                <Text style={styles.notificationTitle}>Promoções</Text>
                <Text style={styles.notificationDescription}>
                  Receba alertas de ofertas e descontos
                </Text>
              </View>
            </View>
            <Switch
              value={promotions}
              onValueChange={setPromotions}
              trackColor={{
                false: themeState.colors.divider,
                true: themeState.colors.primary.main,
              }}
              thumbColor={themeState.colors.background.paper}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <AlertCircle size={24} color={themeState.colors.primary.main} />
              <View style={styles.notificationDetails}>
                <Text style={styles.notificationTitle}>
                  Atualizações do sistema
                </Text>
                <Text style={styles.notificationDescription}>
                  Fique por dentro de tudo que acontece no app.
                </Text>
              </View>
            </View>
            <Switch
              value={systemUpdates}
              onValueChange={setSystemUpdates}
              trackColor={{
                false: themeState.colors.divider,
                true: themeState.colors.primary.main,
              }}
              thumbColor={themeState.colors.background.paper}
            />
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
      overflow: "hidden",
    },
    notificationItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    notificationInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: theme.spacing.lg,
    },
    notificationDetails: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    notificationDescription: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
  });
