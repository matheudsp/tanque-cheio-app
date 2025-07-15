import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Shield, PlayCircle, X } from "lucide-react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";

interface AdOrPremiumModalProps {
  isVisible: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  onGoPremium: () => void;
  stationName: string;
}

export const AdOrPremiumModal = ({
  isVisible,
  onClose,
  onWatchAd,
  onGoPremium,
  stationName,
}: AdOrPremiumModalProps) => {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.container}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={themeState.colors.text.secondary} />
              </TouchableOpacity>

              <Text style={styles.title}>Ver detalhes de {stationName}</Text>
              <Text style={styles.subtitle}>
                Para acessar os detalhes completos, escolha uma das opções abaixo.
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Assistir Anúncio (5s)"
                  onPress={onWatchAd}
                  variant="outline"
                  icon={<PlayCircle size={20} color={styles.buttonText.color} />}
                  style={styles.button}
                  textStyle={styles.buttonText}
                />
                <Button
                  title="Seja Premium"
                  onPress={onGoPremium}
                  variant="primary"
                  icon={<Shield size={20} color={styles.buttonPremiumText.color} />}
                  style={styles.button}
                  textStyle={styles.buttonPremiumText}
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
      padding: 10,
      zIndex: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
      paddingTop: theme.spacing.lg,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      lineHeight: 20,
    },
    buttonContainer: {
      width: "100%",
    },
    button: {
      marginBottom: theme.spacing.md,
      width: "100%",
    },
    buttonText: {
      color: theme.colors.primary.main,
    },
    buttonPremiumText: {
      color: theme.colors.primary.text,
    },
  });