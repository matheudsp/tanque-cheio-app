import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  withDelay,
} from "react-native-reanimated";

import { Button } from "@/components/Button";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);

  // --- Animações ---
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const imageOpacity = useSharedValue(0);

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 1000 });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    contentTranslateY.value = withDelay(400, withTiming(0, { duration: 800 }));
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={[styles.gradientStart.color, styles.gradientEnd.color]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Ilustração animada */}
        <Animated.Image
          source={require("@/assets/images/intro.png")}
          style={[styles.illustration, animatedImageStyle]}
          resizeMode="contain"
        />

        {/* Container de Conteúdo Animado */}
        <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Sua Jornada Começa Aqui.</Text>
          <Text style={styles.subtitle}>
            Encontre os melhores preços de combustível e economize em cada
            parada.
          </Text>

          <Button
            title="Criar Conta Grátis"
            variant="primary"
            size="large"
            onPress={() => router.push("/auth/register")}
            style={styles.button}
          />
        

          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginText}>
              Já tem uma conta? <Text style={styles.loginLink}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    gradientStart: {
      color: theme.colors.background.paper,
    },
    gradientEnd: {
      color: theme.colors.background.default,
    },
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    illustration: {
      width: "120%",
      height: "60%",
      position: "absolute",
      top: -5,
    },
    contentContainer: {
      width: "100%",
      backgroundColor: theme.colors.background.paper,
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing["3xl"],
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      alignItems: "center",
    },
    logo: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    button: {
      width: "100%",
      marginBottom: theme.spacing.xl,
    },
    loginText: {
      fontSize: 15,
      color: theme.colors.text.secondary,
    },
    loginLink: {
      color: theme.colors.primary.main,
      fontWeight: "bold",
    },
  });
