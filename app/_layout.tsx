import { SplashScreen, Stack, useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@/hooks/useToast";
import { ThemeProvider } from "@/providers/themeProvider";
import { PurchasesProvider } from "@/providers/purchasesProvider";
import { AuthProvider } from "@/providers/authProvider";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { storage } from "@/lib/mmkv";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
const OnboardingContext = createContext<{ onComplete: () => void } | null>(
  null
);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode true by default
});

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboarding deve ser usado dentro de um OnboardingProvider"
    );
  }
  return context;
};

SplashScreen.preventAutoHideAsync();
const ONBOARDING_STATUS_KEY = "@hasViewedOnboarding";

export default function RootLayout() {
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [hasViewedOnboarding, setHasViewedOnboarding] = useState<boolean>(
    () => {
      return storage.getBoolean(ONBOARDING_STATUS_KEY) ?? false;
    }
  );
  const router = useRouter();

  useEffect(() => {
    // Esconder a splash screen apenas quando todas as verificações estiverem prontas.
    // A verificação de onboarding é a primeira coisa que deve acontecer.
    if (!isThemeReady) {
      return;
    }
    SplashScreen.hideAsync();
    if (!hasViewedOnboarding) {
      router.replace("/onboarding");
    }
  }, [isThemeReady, hasViewedOnboarding, router]);

  const handleOnboardingComplete = () => {
    storage.set(ONBOARDING_STATUS_KEY, true);
    setHasViewedOnboarding(true);
    router.replace("/tabs");
  };

  return (
    <OnboardingContext.Provider
      value={{ onComplete: handleOnboardingComplete }}
    >
      <ActionSheetProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <ThemeProvider onThemeLoaded={() => setIsThemeReady(true)}>
              <PurchasesProvider>
                <ToastProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="onboarding"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="auth"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="dev" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="tabs"
                      options={{
                        headerShown: false,
                        gestureEnabled: true,
                      }}
                    />
                    <Stack.Screen
                      name="gas-station/[id]"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="profile"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </ToastProvider>
              </PurchasesProvider>
            </ThemeProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </ActionSheetProvider>
    </OnboardingContext.Provider>
  );
}
