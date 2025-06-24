// import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
// import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { ThemeProvider } from "@/providers/themeProvider";

export const unstable_settings = {
  initialRouteName: "splash",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    if (isThemeReady) {
      SplashScreen.hideAsync();
    }
  }, [isThemeReady]);

  return (
    <ThemeProvider onThemeLoaded={() => setIsThemeReady(true)}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NotificationsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen
              name="tabs"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="gas-station" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
        </NotificationsProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
