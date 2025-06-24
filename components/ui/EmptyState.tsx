import LottieView from "lottie-react-native";
import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

type EmptyStateProps = {
  title: string;
  description: string;
  lottieAnimation?: any;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
  style?: ViewStyle;
};

export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({
    title,
    description,
    lottieAnimation,
    icon,
    actionLabel,
    onAction,
    fullScreen = false,
    style,
  }) => {
    const styles = useStylesWithTheme(getStyles);

    return (
      <View
        style={[
          styles.container,
          fullScreen && styles.containerFullScreen,
          style,
        ]}
      >
        <View style={styles.visualsContainer}>
          {lottieAnimation ? (
            <LottieView
              source={lottieAnimation}
              autoPlay
              loop
              style={styles.lottieView}
            />
          ) : icon ? (
            icon
          ) : null}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {actionLabel && onAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      margin: theme.spacing.lg,
    },
    containerFullScreen: {
      flex: 1,
      margin: theme.spacing.none,
      borderRadius: theme.borderRadius.none,
      backgroundColor: theme.colors.background.default,
      justifyContent: "center",
    },
    visualsContainer: {
      marginBottom: theme.spacing.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    lottieView: {
      width: 150,
      height: 150,
    },
    title: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    description: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text.secondary,
      textAlign: "center",
      lineHeight: theme.typography.lineHeight.body,
    },
    actionButton: {
      marginTop: theme.spacing.xl,
      backgroundColor: theme.colors.button.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing["2xl"],
      borderRadius: theme.borderRadius.round,
    },
    actionButtonText: {
      color: theme.colors.primary.text,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.medium,
    },
  });
