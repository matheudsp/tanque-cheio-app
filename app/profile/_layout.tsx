import { Stack } from "expo-router";
import React from "react";

import { useTheme } from "@/providers/themeProvider";

export default function ProfileLayout() {
  const { themeState } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerBackVisible: true,

        headerTintColor: themeState.colors.primary.main,

        headerStyle: {
          backgroundColor: themeState.colors.background.paper,
        },
        headerTitleStyle: {
          fontWeight: "bold",

          color: themeState.colors.text.primary,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="edit" options={{ title: "Editar Perfil" }} />
      <Stack.Screen name="preferences" options={{ title: "Preferências" }} />
      <Stack.Screen name="notifications" options={{ title: "Notificações" }} />
      <Stack.Screen name="help" options={{ title: "Ajuda e Suporte" }} />
      <Stack.Screen name="favorites" options={{ title: "Favoritos" }} />
    </Stack>
  );
}
