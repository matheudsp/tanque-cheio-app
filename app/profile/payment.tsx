import { CreditCard, Plus, Trash2 } from "lucide-react-native";
import { Stack } from "expo-router";
import React from "react";
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
import type { ThemeState } from "@/types/theme";

export default function PaymentScreen() {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const paymentMethods = [
    {
      id: "1",
      type: "Visa",
      last4: "4242",
      expiry: "12/24",
      isDefault: true,
    },
    {
      id: "2",
      type: "Mastercard",
      last4: "8888",
      expiry: "09/25",
      isDefault: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Métodos de Pagamento",
          headerBackTitle: "Voltar",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          {paymentMethods.map((method, index) => (
            <View
              key={method.id}
              style={[
                styles.paymentMethod,
                index === paymentMethods.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.paymentInfo}>
                <CreditCard size={24} color={themeState.colors.primary.main} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.cardType}>{method.type}</Text>
                  <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                  <Text style={styles.cardExpiry}>
                    Expira em {method.expiry}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentActions}>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Padrão</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.deleteButton}>
                  <Trash2 size={20} color={themeState.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={themeState.colors.primary.main} />
          <Text style={styles.addButtonText}>
            Adicionar novo método de pagamento
          </Text>
        </TouchableOpacity>
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
      marginBottom: theme.spacing.lg,
    },
    paymentMethod: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    paymentInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    paymentDetails: {
      marginLeft: theme.spacing.md,
    },
    cardType: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    cardNumber: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    cardExpiry: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    paymentActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    defaultBadge: {
      backgroundColor: theme.colors.action.selected,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.md,
    },
    defaultText: {
      fontSize: 12,
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    deleteButton: {
      padding: theme.spacing.sm,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary.main,
      marginLeft: theme.spacing.sm,
    },
  });
