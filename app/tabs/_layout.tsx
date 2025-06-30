import { Fuel, Home, User } from "lucide-react-native";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as Location from "expo-location";

import { useGasStationStore } from "@/stores/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useUserStore } from "@/stores/userStore";
import { pushNotificationService } from "@/services/push-notification.service";

export default function TabLayout() {
  const { setUserLocation } = useGasStationStore();
  const { themeState } = useTheme();

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão Negada",
          "A permissão de localização é necessária para encontrar postos próximos."
        );
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error("Erro ao obter localização no layout:", error);
        Alert.alert(
          "Erro de Localização",
          "Não foi possível obter sua localização."
        );
      }
    };

    requestLocation();

    // Configura os listeners para notificações push.
    pushNotificationService.setupNotificationListeners();

    // Retorna uma função de limpeza para remover os listeners
    // quando o usuário sair dessa parte do app (ex: logout).
    return () => {
      pushNotificationService.removeListeners();
    };
  }, [setUserLocation]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: themeState.colors.primary.main,
        tabBarInactiveTintColor: themeState.colors.text.secondary,
        tabBarStyle: {
          position: "absolute",
          left: themeState.spacing.sm,
          right: themeState.spacing.sm,
          marginHorizontal: themeState.spacing.sm,
          bottom: Platform.OS === "ios" ? themeState.spacing.xl : themeState.spacing.sm,
          backgroundColor: themeState.colors.background.paper,
          borderRadius: 32,
          height: 72,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
          paddingTop: themeState.spacing.sm,
          borderTopWidth: 0,
          shadowColor: themeState.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Procurar",
          tabBarIcon: ({ color }) => <Fuel size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Minha Conta",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
