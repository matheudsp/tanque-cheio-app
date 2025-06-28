import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@/hooks/useToast";
import { ThemeProvider } from "@/providers/themeProvider";
import { PurchasesProvider } from "@/providers/purchasesProvider";
import { useUserStore } from "@/stores/userStore";
import { AuthProvider } from "@/providers/authProvider";

// Garante que a splash screen não vai se esconder automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useUserStore();
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    // Esconder a splash screen apenas quando a verificação de auth e o tema estiverem prontos.
    if (!isLoading && isThemeReady) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, isThemeReady]);

  return (
    <AuthProvider>
      <ThemeProvider onThemeLoaded={() => setIsThemeReady(true)}>
        <PurchasesProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ToastProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="intro" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen
                  name="tabs"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="gas-station/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
              </Stack>
            </ToastProvider>
          </GestureHandlerRootView>
        </PurchasesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
