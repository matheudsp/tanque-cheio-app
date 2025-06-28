import { Button } from "@/components/Button";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { useTheme } from "@/providers/themeProvider";
import type { ThemeState } from "@/types/theme";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            {
              fontSize: 20,
              fontWeight: themeState.typography.fontWeight.semibold,
            },
          ]}
        >
          Oops!
        </Text>
        <Text style={[styles.title, { fontSize: 16 }]}>
          Essa tela não existe.
        </Text>

        <Button
          style={styles.button}
          onPress={() => router.replace("/tabs")}
          title="Ir ao início"
        />
      </View>
    </>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.default,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    title: {
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
    },
    button: {
      marginTop: theme.spacing["2xl"],
      paddingVertical: 15,
      paddingHorizontal: theme.spacing["5xl"],
    },
  });
