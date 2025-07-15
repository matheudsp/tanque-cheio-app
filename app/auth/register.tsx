import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {Image} from 'expo-image'
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, User } from "lucide-react-native";
import { useUserStore } from "@/stores/userStore";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import { AuthInput } from "@/components/auth/AuthInput";
import type { ThemeState } from "@/types/theme";
import { toast } from "@/hooks/useToast";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useUserStore();
  const styles = useStylesWithTheme(getStyles);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error({
        title: "Campos Incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        passwordConfirmation: confirmPassword,
      });
      router.replace("/auth/login");
    } catch (e) {
      console.log("Falha no registro (tratado na store):", e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            extraScrollHeight={Platform.OS === "ios" ? 20 : 80}
          >
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>Crie sua Conta</Text>
              <Text style={styles.subtitle}>É rápido, fácil e gratuito.</Text>
            </View>

            <View style={styles.formContainer}>
              <AuthInput
                label="Nome Completo"
                icon={User}
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
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
                placeholder="Crie uma senha forte"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
              <AuthInput
                label="Confirmar Senha"
                icon={Lock}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />

              <Button
                title="Criar Conta"
                onPress={handleRegister}
                loading={isLoading}
                size="large"
                fullWidth
                style={{ marginTop: 24 }}
              />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => router.push("/auth/login")}
              >
                <Text style={styles.footerText}>Já tem uma conta?</Text>
                <Text style={styles.footerLink}> Faça Login</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
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
      width: 60,
      height: 60,
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
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: theme.spacing.xl,
    },
    footerText: { color: theme.colors.text.secondary },
    footerLink: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
