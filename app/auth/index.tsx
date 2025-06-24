import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function AuthIndexScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/intro.png")}
        style={styles.illustration}
        resizeMode="contain"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Explore o mundo facilmente</Text>
        <Text style={styles.subtitle}>Ao seu desejo</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          variant="primary"
          size="large"
          onPress={() => router.push("/auth/login")}
          style={styles.button}
        />

        <Button
          title="Registrar"
          variant="secondary"
          size="large"
          onPress={() => router.push("/auth/register")}
          style={styles.button}
        />
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
      paddingVertical: 24,
    },
    illustration: {
      width: "100%",
      height: "50%",
      marginBottom: 32,
    },
    textContainer: {
      alignItems: "flex-start",
      paddingHorizontal: 24,
      width: "100%",
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.text.secondary,
    },
    buttonContainer: {
      gap: 16,
      paddingHorizontal: 24,
      width: "100%",
      marginBottom: 24,
    },
    button: {
      width: "100%",
    },
  });
