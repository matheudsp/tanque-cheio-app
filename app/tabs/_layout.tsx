import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { Fuel, Home, User } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Alert, Platform } from "react-native";
import { useGasStationStore } from "@/store/gasStationStore";
import * as Location from "expo-location";

export default function TabLayout() {
  const { setUserLocation } = useGasStationStore();
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
  }, []);
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: "absolute",
          left: 8,
          right: 8,
          marginHorizontal: 8,
          bottom: 16,
          backgroundColor: "#fff",
          borderRadius: 32,
          height: 72,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
          paddingTop: 8,
          borderTopWidth: 0,
          shadowColor: "#000",
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
          title: "Home",
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
