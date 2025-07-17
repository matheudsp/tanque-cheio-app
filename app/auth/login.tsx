import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock } from "lucide-react-native";

import { useUserStore } from "@/stores/userStore";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialButton } from "@/components/auth/SocialButton";
import type { ThemeState } from "@/types/theme";
import { toast } from "@/hooks/useToast";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri, revokeAsync } from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, loginWithGoogle, isAuthenticated } = useUserStore();

  const styles = useStylesWithTheme(getStyles);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/tabs");
    }
  }, [isAuthenticated]);
  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error({
        title: "Preencha os campos",
        description: "É necessário preencher os campos.",
      });
    }
    try {
      await login(email, password);
    } catch {
      // Erro tratado no store
    }
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: "com.matheudsp.tanquecheio",
    }),
  });

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (!response) {
        // Garantir que o loading seja falso se não houver resposta ainda
        setIsGoogleLoading(false);
        return;
      }

      if (response.type === "success") {
        setIsGoogleLoading(true);
        const { id_token } = response.params;
        if (id_token) {
          try {
            await loginWithGoogle(id_token);
          } catch (error) {
            console.error("Falha no fluxo de login com Google:", error);
          } finally {
            setIsGoogleLoading(false);
          }
        } else {
          toast.error({
            title: "Erro de Autenticação",
            description: "Não foi possível obter o token do Google.",
          });
          setIsGoogleLoading(false);
        }
      } else {
        // Cancelado ou erro
        setIsGoogleLoading(false);
        if (response.type === "error") {
          toast.error({
            title: "Erro no login com Google",
            description: response.error?.message || "Ocorreu um erro.",
          });
        }
      }
    };

    handleGoogleResponse();
  }, [response?.type]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                onPress={() => router.push("/auth/forgot-password")}
              >
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
              </TouchableOpacity>
              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={isLoading}
                size="medium"
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
                  promptAsync();
                }}
                disabled={!request || isLoading || isGoogleLoading}
                loading={isGoogleLoading || isLoading}
              />

              {Platform.OS === "ios" && (
                <SocialButton type="apple" onPress={() => {}} />
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => router.push("/auth/register")}
              >
                <Text style={styles.footerText}>Não tem uma conta?</Text>
                <Text style={styles.footerLink}> Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
