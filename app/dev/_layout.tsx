import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import React from "react";

import { useTheme } from "@/providers/themeProvider";

export default function DeveloperLayout() {
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
      <Stack.Screen
        name="developer"
        options={{ title: "Opções do Desenvolvedor" }}
      />
    </Stack>
  );
}
