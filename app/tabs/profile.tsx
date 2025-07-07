import {
  Bell,
  ChevronRight,
  CreditCard,
  Fuel,
  HelpCircle,
  LogOut,
  Settings,
  Trash2,
  User,
  Wrench,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";
import { useUserStore } from "@/stores/userStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isPremium, logout } = useUserStore();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout();
      router.replace("/");
    } else {
      Alert.alert("Sair", "Você tem certeza que quer sair?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          onPress: () => {
            logout();
            router.replace("/auth/login");
          },
          style: "destructive",
        },
      ]);
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      "Limpar Todos os Dados",
      "Esta ação é irreversível e apagará todos os dados salvos no aplicativo. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar Tudo",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              logout();
              router.replace("/auth/login");
              Alert.alert(
                "Sucesso",
                "Todos os dados do aplicativo foram limpos."
              );
            } catch (e) {
              Alert.alert(
                "Erro",
                "Não foi possível limpar os dados do aplicativo."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const menuItems = useMemo(
    () => [
      {
        title: "Conta",
        items: [
          {
            icon: <Fuel size={20} color={themeState.colors.primary.main} />,
            label: "Meus Alertas de Preço",
            onPress: () => router.push("/profile/favorites"),
          },
          {
            icon: <User size={20} color={themeState.colors.primary.main} />,
            label: "Informações Pessoais",
            onPress: () => router.push("/profile/personal-info"),
          },
          {
            icon: <Settings size={20} color={themeState.colors.primary.main} />,
            label: "Preferências",
            onPress: () => router.push("/profile/preferences"),
          },
          {
            icon: (
              <CreditCard size={20} color={themeState.colors.primary.main} />
            ),
            label: "Métodos de Pagamento",
            onPress: () => router.push("/profile/payment"),
          },
        ],
      },
      {
        title: "Outros",
        items: [
          {
            icon: <Bell size={20} color={themeState.colors.primary.main} />,
            label: "Notificações",
            onPress: () => router.push("/profile/notifications"),
          },
          ...(__DEV__
            ? [
                {
                  icon: (
                    <Wrench size={20} color={themeState.colors.primary.main} />
                  ),
                  label: "Opções do Desenvolvedor",
                  onPress: () => router.push("/dev/developer"),
                },
              ]
            : []),
          {
            icon: (
              <HelpCircle size={20} color={themeState.colors.primary.main} />
            ),
            label: "Ajuda & Suporte",
            onPress: () => router.push("/profile/help"),
          },
          {
            icon: <Trash2 size={20} color={themeState.colors.error} />,
            label: "Limpar Dados do App",
            onPress: handleClearStorage,
            textColor: themeState.colors.error,
          },
          {
            icon: <LogOut size={20} color={themeState.colors.error} />,
            label: "Sair",
            onPress: handleLogout,
            textColor: themeState.colors.error,
          },
        ],
      },
    ],
    [themeState, router, handleLogout, handleClearStorage]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color={themeState.colors.primary.main} />
          </View>

          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{user?.name || "Usuário"}</Text>
            <SubscriptionBadge isPremium={isPremium} style={styles.badge} />
          </View>

          <Text style={styles.profileEmail}>
            {user?.email || "guest@tanquecheio.app"}
          </Text>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push("/profile/edit")}
          >
            <Text style={styles.editProfileText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  {item.icon}
                  <Text
                    style={[
                      styles.menuItemLabel,
                      item.textColor ? { color: item.textColor } : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={themeState.colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
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
    scrollContent: {
      padding: theme.spacing.lg,
      paddingBottom: 100,
    },
    profileHeader: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    profileNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    profileName: {
      fontSize: 24,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    badge: {},
    profileEmail: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    avatar: {
      marginVertical: theme.spacing.xl,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.action.selected,
      alignItems: "center",
      justifyContent: "center",
    },
    editProfileButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.action.selected,
    },
    editProfileText: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary.main,
    },
    menuSection: {
      marginBottom: theme.spacing.xl,
    },
    menuSectionTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemLabel: {
      fontSize: 16,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
    },
    versionContainer: {
      alignItems: "center",
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    versionText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });
