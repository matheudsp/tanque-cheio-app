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
import { useUserStore } from "@/store/userStore";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";

export default function RegisterScreen() {
  useEffect(() => {
    console.log("Register Screen rendered");
  }, []);

  const router = useRouter();
  const { register, isLoading, error } = useUserStore();
  const [formError, setFormError] = useState("");

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
            <User size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={colors.primary}
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Sobrenome"
              placeholderTextColor={colors.primary}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.primary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Numero de Celular"
              placeholderTextColor={colors.primary}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.primary}
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
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Confirme a Senha"
              placeholderTextColor={colors.primary}
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
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: colors.error + "20",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary,
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
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
