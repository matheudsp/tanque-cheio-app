import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail } from "lucide-react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import { AuthInput } from "@/components/auth/AuthInput";
import type { ThemeState } from "@/types/theme";
import { useUserStore } from "@/stores/userStore"; 
import { toast } from "@/hooks/useToast";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);
  const [email, setEmail] = useState("");

 
  const { forgotPassword, isLoading } = useUserStore();

  const handleSendRequest = async () => {
    if (!email) {
      toast.error({
        title: "Campo Obrigatório",
        description: "Por favor, insira seu e-mail.",
      });
      return;
    }

    const success = await forgotPassword(email);

    if (success) {
      router.push({ pathname: "/auth/reset-password", params: { email } });
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
            <Text style={styles.title}>Esqueceu a Senha?</Text>
            <Text style={styles.subtitle}>
              Insira seu e-mail para receber um código de redefinição.
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
            <Button
              title="Enviar Código"
              onPress={handleSendRequest}
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
