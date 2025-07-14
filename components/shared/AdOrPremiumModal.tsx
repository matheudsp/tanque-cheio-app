// /components/shared/AdOrPremiumModal.tsx

import React from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import { Shield, PlayCircle } from "lucide-react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { Button } from "@/components/Button";
import type { ThemeState } from "@/types/theme";

interface AdOrPremiumModalProps {
  isVisible: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  onGoPremium: () => void;
  stationName: string;
}

/**
 * @description Modal que oferece ao usuário a escolha entre assistir um anúncio
 * ou tornar-se premium para visualizar os detalhes de um posto.
 * @param {boolean} isVisible - Controla a visibilidade do modal.
 * @param {() => void} onClose - Função para fechar o modal.
 * @param {() => void} onWatchAd - Função a ser executada quando o usuário escolhe assistir ao anúncio.
 * @param {() => void} onGoPremium - Função a ser executada quando o usuário opta por se tornar premium.
 * @param {string} stationName - Nome do posto para exibir no título.
 */
export const AdOrPremiumModal = ({
  isVisible,
  onClose,
  onWatchAd,
  onGoPremium,
  stationName,
}: AdOrPremiumModalProps) => {
  const styles = useStylesWithTheme(getStyles);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
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
