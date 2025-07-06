import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Hash } from "lucide-react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import { AuthInput } from "@/components/auth/AuthInput";
import type { ThemeState } from "@/types/theme";
import { useUserStore } from "@/stores/userStore";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const styles = useStylesWithTheme(getStyles);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { resetPassword, isLoading } = useUserStore();

  const handleResetPassword = async () => {
    const success = await resetPassword({
      email: params.email,
      code,
      password,
      passwordConfirmation: confirmPassword,
    });

    if (success) {
      router.replace("/auth/login");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>
              Insira o código enviado para {params.email} e sua nova senha.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <AuthInput
              label="Código de Verificação"
              icon={Hash}
              placeholder="A1B2C3"
              value={code}
              onChangeText={setCode}
              keyboardType="default"
              maxLength={6}
            />
            <AuthInput
              label="Nova Senha"
              icon={Lock}
              placeholder="Crie uma nova senha"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
            <AuthInput
              label="Confirmar Nova Senha"
              icon={Lock}
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />
            <Button
              title="Redefinir Senha"
              onPress={handleResetPassword}
              loading={isLoading}
              size="large"
              fullWidth
              style={{ marginTop: 24 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.xl,
      justifyContent: "center",
    },
    header: { alignItems: "center", marginBottom: theme.spacing["2xl"] },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
    formContainer: { marginBottom: theme.spacing.xl },
  });
