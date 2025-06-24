import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function IntroScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const handlePress = () => {
    router.replace("splash" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/intro.png")}
        style={styles.illustration}
        resizeMode="contain"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Acompanhe os preços</Text>
        <Text style={styles.subtitle}>para manter seu tanque cheio!</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.paginationDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handlePress}>
          <ChevronRight size={24} color={themeState.colors.primary.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.xl,
    },
    illustration: {
      width: "100%",
      height: "50%",
      marginBottom: theme.spacing["2xl"],
    },
    textContainer: {
      alignItems: "flex-start",
      paddingHorizontal: theme.spacing.xl,
      width: "100%",
      marginBottom: theme.spacing["3xl"],
    },
    title: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.text.secondary,
    },
    bottomContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: theme.spacing.xl,
    },
    paginationDots: {
      flexDirection: "row",
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.divider,
      marginHorizontal: theme.spacing.xs,
    },
    activeDot: {
      backgroundColor: theme.colors.primary.main,
    },
    nextButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary.main,
      justifyContent: "center",
      alignItems: "center",
    },
  });
