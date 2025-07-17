import { Camera, Mail, User } from "lucide-react-native";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserStore } from "@/stores/userStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function EditProfileScreen() {
  const { user, updateUser } = useUserStore();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Erro", "Por favor, insira seu nome completo.");
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu e-mail.");
      return;
    }

    updateUser({
      ...user,
      ...formData,
    });

    Alert.alert("Sucesso", "Perfil atualizado com sucesso.", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={themeState.colors.primary.main} />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={themeState.colors.primary.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarText}>Alterar foto de perfil</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={20} color={themeState.colors.primary.main} />
              <Text style={styles.label}>Nome Completo</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholder="Insira seu nome completo"
              placeholderTextColor={themeState.colors.text.hint}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Mail size={20} color={themeState.colors.primary.main} />
              <Text style={styles.label}>E-mail</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Insira seu e-mail"
              placeholderTextColor={themeState.colors.text.hint}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.action.selected,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary.main,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.colors.background.paper,
    },
    avatarText: {
      fontSize: 14,
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    formSection: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    inputLabel: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.background.default,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    saveButton: {
      backgroundColor: theme.colors.primary.main,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      alignItems: "center",
    },
    saveButtonText: {
      color: theme.colors.primary.text,
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
