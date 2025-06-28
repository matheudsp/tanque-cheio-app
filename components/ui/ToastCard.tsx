// src/components/ui/NotificationCard.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotificationController } from 'react-native-notificated';

import { useTheme } from '@/providers/themeProvider';
import { useStylesWithTheme } from '@/hooks/useStylesWithTheme';
import type { ThemeState } from '@/types/theme';

// A interface de props permanece a mesma.
export interface ToastCardProps {
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
}


const getToastTypeStyles = (theme: ThemeState) => ({
  success: {
    icon: 'checkmark-circle' as const,
    color: theme.colors.success,
  },
  error: {
    icon: 'close-circle' as const,
    color: theme.colors.error,
  },
  info: {
    icon: 'information-circle' as const,
    color: theme.colors.info,
  },
  warning: {
    icon: 'warning' as const,
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
  const styles = useStylesWithTheme(getStyles);

  
  const styleConfig = getToastTypeStyles(themeState)[type];

  return (
    <View style={[styles.container, { borderLeftColor: styleConfig.color }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={styleConfig.icon} size={28} color={styleConfig.color} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <TouchableOpacity onPress={() => remove()} style={styles.closeButton}>
        
        <Ionicons
          name="close"
          size={24}
          color={themeState.colors.text.secondary}
        />
      </TouchableOpacity>
    </View>
  );
};


const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.paper, 
      borderRadius: theme.borderRadius.medium, 
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      borderLeftWidth: 5,
      
      ...theme.shadows.shadowMd,
    },
    iconContainer: {
      marginRight: theme.spacing.md,
    },
    contentContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary, 
    },
    description: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text.secondary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
  });