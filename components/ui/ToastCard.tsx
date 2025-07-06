import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotificationController } from "react-native-notificated";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { useTheme } from "@/providers/themeProvider";
import { durationMs } from "@/hooks/useToast";
import type { ThemeState } from "@/types/theme";

export interface ToastCardProps {
  title: string;
  description: string;
  type: "success" | "error" | "info" | "warning";
}


const getToastTypeStyles = (theme: ThemeState) => ({
  success: {
    icon: "checkmark-circle" as const,
    color: theme.colors.success, 
  },
  error: {
    icon: "close-circle" as const,
    color: theme.colors.error, 
  },
  info: {
    icon: "information-circle" as const,
    color: theme.colors.info, 
  },
  warning: {
    icon: "warning" as const,
    color: theme.colors.warning, 
  },
});

export const NotificationCard = ({
  title,
  description,
  type,
}: ToastCardProps) => {
  const { remove } = useNotificationController();
  const { themeState } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStylesWithTheme(getStyles);

  const styleConfig = getToastTypeStyles(themeState)[type];
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(0, {
      duration: durationMs,
      easing: Easing.linear,
    });
  }, [progress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [`${styleConfig.color}00`, `${styleConfig.color}FF`]
    );
    return {
      borderColor,
    };
  });

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <AnimatedTouchable
      onPress={() => remove()}
      activeOpacity={0.9}
      style={[
        styles.container,
        { marginTop: top + 10 },
        animatedContainerStyle,
        themeState.shadows.shadowMd,
      ]}
    >
      <View
        style={[styles.iconOuterCircle, { backgroundColor: styleConfig.color }]}
      >
        <Ionicons name={styleConfig.icon} size={22} color={"white"} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <TouchableOpacity onPress={() => remove()} style={styles.closeButton}>
        <Ionicons
          name="close"
          size={20}
          color={themeState.colors.text.secondary}
        />
      </TouchableOpacity>
    </AnimatedTouchable>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      width: "90%",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.round,
      paddingVertical: theme.spacing.md,
      paddingLeft: 35,
      paddingRight: theme.spacing.lg,
      borderWidth: 2,
    },
    iconOuterCircle: {
      position: "absolute",
      left: -15,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadows.shadowSm,
    },
    contentContainer: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    title: {
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    description: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    closeButton: {
      paddingLeft: theme.spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
  });
