import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { LucideIcon, Eye, EyeOff } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useAnimatedProps,
} from "react-native-reanimated";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

interface AuthInputProps extends TextInputProps {
  icon: LucideIcon;
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const AuthInput = ({
  icon: Icon,
  label,
  error,
  isPassword = false,
  ...props
}: AuthInputProps) => {
  const { themeState } = useTheme();
  const styles = useStylesWithTheme(getStyles);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const focusAnimation = useSharedValue(0);

  
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    focusAnimation.value = withTiming(1, { duration: 300 });
  
    props.onFocus?.(e);
  };

  
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    focusAnimation.value = withTiming(0, { duration: 300 });
  
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [themeState.colors.border, themeState.colors.primary.main]
    );
    return {
      borderColor,
    };
  });

  const animatedIconProps = useAnimatedProps(() => {
    const iconColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [themeState.colors.text.secondary, themeState.colors.primary.main]
    );
    return {
      color: iconColor,
    };
  });

  const AnimatedIcon = Animated.createAnimatedComponent(Icon);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputContainer,
          animatedContainerStyle,
          !!error && styles.inputContainerError,
        ]}
      >
        <AnimatedIcon
          size={20}
          style={styles.icon}
          animatedProps={animatedIconProps}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={themeState.colors.text.hint}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            {isPasswordVisible ? (
              <EyeOff color={themeState.colors.text.secondary} size={20} />
            ) : (
              <Eye color={themeState.colors.text.secondary} size={20} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      height: 56,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    inputContainerError: {
      borderColor: theme.colors.error,
    },
    icon: {
      marginRight: theme.spacing.md,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text.primary,
      height: "100%",
    },
    eyeIcon: {
      padding: theme.spacing.sm,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
  });
