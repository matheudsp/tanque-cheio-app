import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { Lock, X } from "lucide-react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import { AuthInput } from "@/components/auth/AuthInput";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";

interface DeveloperPasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading?: boolean;
}

export const DeveloperPasswordModal = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading = false,
}: DeveloperPasswordModalProps) => {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(password);
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={themeState.colors.text.secondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Acesso Restrito</Text>
          <Text style={styles.subtitle}>
            Digite a senha para acessar as opções de desenvolvedor.
          </Text>

          <View style={styles.inputWrapper}>
            <AuthInput
              label="Senha"
              icon={Lock}
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              isPassword
              onSubmitEditing={handleSubmit}
            />
          </View>

          <Button
            title="Acessar"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="large"
          />
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    container: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.xl,
      width: "100%",
      alignItems: "center",
      ...theme.shadows.shadowMd,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
    title: {
      fontSize: 20,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },

    inputWrapper: {
      width: "100%",
    },
  });
