import {
  CircleUser,
  Fuel,
  Home,
  PersonStanding,
  Search,
  User,
  UserRound,
  UsersRound,
} from "lucide-react-native";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Platform, View } from "react-native";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { useGasStationStore } from "@/stores/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useUserStore } from "@/stores/userStore";
import { pushNotificationService } from "@/services/push-notification.service";
import { BannerAdComponent } from "@/components/ads/BannerAd";
const BANNER_AD_HEIGHT = 60;

export default function TabLayout() {
  const { setUserLocation } = useGasStationStore();
  const { themeState } = useTheme();
  const { isPremium } = useUserStore();

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
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          animation: "shift",
          tabBarActiveTintColor: themeState.colors.primary.main,
          tabBarInactiveTintColor: themeState.colors.text.secondary,
          tabBarStyle: {
            position: "absolute",
            left: themeState.spacing.sm,
            right: themeState.spacing.sm,
            marginHorizontal: themeState.spacing.sm,
            bottom: isPremium
              ? Platform.OS === "ios"
                ? themeState.spacing.xl
                : themeState.spacing.lg
              : BANNER_AD_HEIGHT + themeState.spacing.sm,
            backgroundColor: themeState.colors.background.paper,
            borderRadius: 32,
            borderColor: themeState.colors.border,
            borderWidth: 0.5,
            height: 72,
            paddingBottom: Platform.OS === "ios" ? 24 : 12,
            paddingTop: themeState.spacing.sm,
            shadowColor: themeState.colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
            zIndex: 10,
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
            tabBarIcon: ({ color, focused }) => (
              <Home
                size={24}
                fill={focused ? themeState.colors.primary.main : "transparent"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Procurar",
            tabBarIcon: ({ color, focused }) => (
              <Search
                size={24}
                fill={focused ? themeState.colors.primary.main : "transparent"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Minha Conta",
            tabBarIcon: ({ color, focused }) => (
              <User
                size={24}
                fill={focused ? themeState.colors.primary.main : "transparent"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      {!isPremium && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            alignItems: "center",
            height: BANNER_AD_HEIGHT,
          }}
        >
          <BannerAdComponent />
        </View>
      )}
    </View>
  );
}
