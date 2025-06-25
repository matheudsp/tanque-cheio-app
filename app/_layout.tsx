import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { ThemeProvider } from "@/providers/themeProvider";
import { PurchasesProvider } from "@/providers/purchasesProvider";

export const unstable_settings = {
  initialRouteName: "intro",
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
      <PurchasesProvider>
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
              <Stack.Screen
                name="gas-station/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
            </Stack>
          </NotificationsProvider>
        </GestureHandlerRootView>
      </PurchasesProvider>
    </ThemeProvider>
  );
}
