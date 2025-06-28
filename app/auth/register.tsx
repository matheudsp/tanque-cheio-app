import React, { useEffect, useState } from "react";
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
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
import { useUserStore } from "@/stores/userStore";

import { Button } from "@/components/Button";
import type { ThemeState } from "@/types/theme";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { useTheme } from "@/providers/themeProvider";

export default function RegisterScreen() {
  useEffect(() => {
    console.log("Register Screen rendered");
  }, []);

  const router = useRouter();
  const { register, isLoading, error } = useUserStore();
  const [formError, setFormError] = useState("");
  const styles = useStylesWithTheme(getStyles);
  const {themeState} = useTheme()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
      });
      router.replace("/tabs/index");
    } catch (error) {
      return;
    }
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Register",
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
            <Image
              source={require("@/assets/images/playstore.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Tanque Cheio</Text>
          </View>

          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Crie sua conta para ter acesso aos preços dos combustíveis próximos
            à você.
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {formError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

            <View style={styles.inputContainer}>
            <User size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={themeState.colors.text.hint}
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Sobrenome"
              placeholderTextColor={themeState.colors.text.hint}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={themeState.colors.text.hint}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Numero de Celular"
              placeholderTextColor={themeState.colors.text.hint}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={themeState.colors.text.hint}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
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

          <View style={styles.inputContainer}>
            <Lock size={20} color={styles.icon.color} />
            <TextInput
              style={styles.input}
              placeholder="Confirme a Senha"
              placeholderTextColor={themeState.colors.text.hint}
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={styles.icon.color} />
              ) : (
                <Eye size={20} color={styles.icon.color} />
              )}
            </TouchableOpacity>
          </View>

          <Button
            title="Criar Conta"
            variant="primary"
            size="large"
            loading={isLoading}
            onPress={handleRegister}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já possui conta?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
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
      marginBottom: 32,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 16,
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
      backgroundColor: theme.colors.error + "20", // Adiciona opacidade à cor de erro
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
      backgroundColor: theme.colors.background.paper,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
      height: 56,
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
    eyeIcon: {
      padding: 4,
    },
    registerButton: {
      marginBottom: 24,
    },
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
    loginText: {
      color: theme.colors.text.secondary,
      fontSize: 14,
    },
    loginLink: {
      color: theme.colors.primary.main,
      fontSize: 14,
      fontWeight: "500",
    },
  });
