import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import React from "react";

import { useTheme } from "@/providers/themeProvider";

export default function ProfileLayout() {
  const { themeState } = useTheme();

  const CustomBackButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
      <Feather
        name="arrow-left"
        size={24}
        color={themeState.colors.primary.main}
      />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <CustomBackButton />,
        headerStyle: {
          backgroundColor: themeState.colors.background.paper,
        },
        headerTintColor: themeState.colors.text.primary,
        headerTitleStyle: {
          fontWeight: "bold",
          color: themeState.colors.text.primary,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="edit" options={{ title: "Editar Perfil" }} />
      <Stack.Screen
        name="personal-info"
        options={{ title: "Informações Pessoais" }}
      />
      <Stack.Screen name="preferences" options={{ title: "Preferências" }} />
      <Stack.Screen name="payment" options={{ title: "Pagamentos" }} />
      <Stack.Screen name="notifications" options={{ title: "Notificações" }} />
      <Stack.Screen name="help" options={{ title: "Ajuda e Suporte" }} />
      <Stack.Screen name="favorites" options={{ title: "Favoritos" }} />
    </Stack>
  );
}
