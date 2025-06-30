import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock } from "lucide-react-native";

import { useUserStore } from "@/stores/userStore";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import { AuthInput } from "@/components/auth/AuthInput"; // Nosso novo componente
import { SocialButton } from "@/components/auth/SocialButton"; // Nosso novo componente
import type { ThemeState } from "@/types/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useUserStore();
  const styles = useStylesWithTheme(getStyles);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Adicionar validação básica de UI antes de chamar a store
    if (!email || !password) {
      // Idealmente, o estado de erro nos inputs cuidaria disso
      return;
    }
    try {
      await login(email, password);
      router.replace("/tabs");
    } catch (e) {
      // O erro já é tratado na store e exibido pelo toast
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
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>
              Economize no seu próximo abastecimento.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <AuthInput
              label="E-mail"
              icon={Mail}
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInput
              label="Senha"
              icon={Lock}
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
            <TouchableOpacity
              onPress={() => {
                /* Lógica de esqueci a senha */
              }}
            >
              <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              size="large"
              fullWidth
              style={{ marginTop: 24 }}
            />
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>OU</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <SocialButton
              type="google"
              onPress={() => {
                /* Lógica de login com Google */
              }}
            />
            {Platform.OS === "ios" && (
              <SocialButton
                type="apple"
                onPress={() => {
                  /* Lógica de login com Apple */
                }}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.footerText}>Não tem uma conta?</Text>
              <Text style={styles.footerLink}> Cadastre-se</Text>
            </TouchableOpacity>
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
    logo: {
      width: 80,
      height: 80,
      marginBottom: theme.spacing.sm,
      borderRadius: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: { fontSize: 16, color: theme.colors.text.secondary },
    formContainer: { marginBottom: theme.spacing.xl },
    forgotPassword: {
      textAlign: "right",
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.semibold,
      marginTop: -theme.spacing.sm,
    },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.xl,
    },
    line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
    separatorText: {
      marginHorizontal: theme.spacing.md,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    socialContainer: { alignItems: "center" },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: theme.spacing["2xl"],
    },
    footerText: { color: theme.colors.text.secondary },
    footerLink: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
