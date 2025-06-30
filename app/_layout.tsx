import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@/hooks/useToast";
import { ThemeProvider } from "@/providers/themeProvider";
import { PurchasesProvider } from "@/providers/purchasesProvider";
import { useUserStore } from "@/stores/userStore";
import { AuthProvider } from "@/providers/authProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [hasViewedOnboarding, setHasViewedOnboarding] = useState<
    boolean | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem("@hasViewedOnboarding");
        setHasViewedOnboarding(value === "true");
      } catch (e) {
        console.error("Failed to load onboarding status.", e);
        setHasViewedOnboarding(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Esconder a splash screen apenas quando todas as verificações estiverem prontas.
    // A verificação de onboarding é a primeira coisa que deve acontecer.
    if (hasViewedOnboarding === null || !isThemeReady) {
      return;
    }

    if (!hasViewedOnboarding) {
      router.replace("/onboarding");
    }
  }, [isThemeReady, hasViewedOnboarding, router]);

  return (
    <AuthProvider>
      <ThemeProvider onThemeLoaded={() => setIsThemeReady(true)}>
        <PurchasesProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ToastProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false }}
                />
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
