import React from "react";
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
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  FuelIcon,
  HelpCircle,
  LogOut,
  Settings,
  Trash2,
  User,
} from "lucide-react-native";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout();
      router.replace("/");
    } else {
      Alert.alert("Sair", "Você tem certeza que quer sair?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
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
      "Esta ação é irreversível e apagará todos os dados salvos no aplicativo, incluindo suas informações de login e favoritos. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar Tudo",
          onPress: async () => {
            try {
              // Limpa todo o AsyncStorage
              await AsyncStorage.clear();
              // Faz o logout para limpar o estado do Zustand e redirecionar
              logout();
              router.replace("/auth/login");
              // Alerta de sucesso (opcional)
              Alert.alert(
                "Sucesso",
                "Todos os dados do aplicativo foram limpos."
              );
            } catch (e) {
              console.error("Falha ao limpar o AsyncStorage.", e);
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

  const menuItems = [
    {
      title: "Conta",
      items: [
        {
          icon: <FuelIcon size={20} color={colors.primary} />,
          label: "Postos que você segue",
          onPress: () => router.push("/profile/favorites"),
        },
        {
          icon: <User size={20} color={colors.primary} />,
          label: "Informações pessoais",
          onPress: () => router.push("/profile/personal-info"),
        },
        {
          icon: <Settings size={20} color={colors.primary} />,
          label: "Preferências",
          onPress: () => router.push("/profile/preferences"),
        },
        {
          icon: <CreditCard size={20} color={colors.primary} />,
          label: "Métodos de Pagamento",
          onPress: () => router.push("/profile/payment"),
        },
      ],
    },
    {
      title: "Outros",
      items: [
        {
          icon: <Bell size={20} color={colors.primary} />,
          label: "Notificações",
          onPress: () => router.push("/profile/notifications"),
        },
        {
          icon: <HelpCircle size={20} color={colors.primary} />,
          label: "Ajuda & Suporte",
          onPress: () => router.push("/profile/help"), // Changed from "/profile/support" to existing route
        },
        {
          icon: <Trash2 size={20} color={colors.error} />,
          label: "Limpar Dados do App",
          onPress: handleClearStorage,
          textColor: colors.error,
        },
        {
          icon: <LogOut size={20} color={colors.error} />,
          label: "Sair",
          onPress: handleLogout,
          textColor: colors.error,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color={colors.primary} />
          </View>

          <Text style={styles.profileName}>{user?.name || "Usuário"}</Text>
          <Text style={styles.profileEmail}>
            {user?.email || "guest@mail.com"}
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
                <ChevronRight size={20} color={colors.textSecondary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 50,
    marginVertical: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },

  avatar: {
    marginVertical: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  profileEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
