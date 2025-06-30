import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function SplashScreen() {
  const styles = useStylesWithTheme(getStyles);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      pulseAnimation,
    ]).start();

    return () => {
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Tanque Cheio</Text>
        <Text style={styles.tagline}>Seu app para manter o tanque cheio!</Text>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      alignItems: "center",
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: theme.spacing.xl,
    },
    appName: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    tagline: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
  });
