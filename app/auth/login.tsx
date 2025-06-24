import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useUserStore } from "@/store/userStore";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useUserStore();
  const styles = useStylesWithTheme(getStyles);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { themeState } = useTheme();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/tabs"); // Using the correct route format
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleRegister = () => {
    router.push("/auth/register");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Login",
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>⛽</Text>
            </View>
            <Text style={styles.appName}>Tanque Cheio</Text>
            <Text style={styles.subtitle}>
              Desenvolvido com 🧡 por @matheudsp
            </Text>
          </View>

          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>Acesse para continuar</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Mail size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor={themeState.colors.text.hint}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={themeState.colors.text.hint}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color={styles.icon.color} />
              ) : (
                <Eye size={20} color={styles.icon.color} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <Button
            title="Entrar"
            variant="primary"
            size="large"
            loading={isLoading}
            onPress={handleLogin}
            style={styles.loginButton}
           
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Ainda não tem conta? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 40,
      rowGap: 10,
    },
    logo: {
      width: 80,
      height: 80,
      backgroundColor: theme.colors.secondary.main,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    input: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    icon: {
      color: theme.colors.text.secondary,
    },
    logoText: {
      color: theme.colors.text.primary,
      fontSize: 36,
      fontWeight: "bold",
    },
    appName: {
      fontSize: 24,
      fontWeight: "600",
      color: theme.colors.text.primary,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: 24,
    },
    errorContainer: {
      backgroundColor: theme.colors.error + "20",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.default,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
      height: 56,
    },

    eyeIcon: {
      padding: 4,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: theme.colors.primary.main,
      fontSize: 14,
      fontWeight: "500",
    },
    loginButton: {
      marginBottom: 24,
    },
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    registerText: {
      color: theme.colors.text.secondary,
      fontSize: 14,
    },
    registerLink: {
      color: theme.colors.primary.main,
      fontSize: 14,
      fontWeight: "500",
    },
  });
};
