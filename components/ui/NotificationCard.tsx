// src/components/ui/NotificationCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotificationController } from 'react-native-notificated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

// Interface para as propriedades do nosso componente de notificação
export interface NotificationCardProps {
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Mapeamento de tipos para cores e ícones para fácil customização
const notificationStyles = {
  success: {
    icon: 'checkmark-circle' as const,
    color: colors.success,
  },
  error: {
    icon: 'close-circle' as const,
    color: colors.error,
  },
  info: {
    icon: 'information-circle' as const,
    color: colors.primary,
  },
  warning: {
    icon: 'warning' as const,
    color: colors.warning,
  },
};

export const NotificationCard = ({ title, description, type }: NotificationCardProps) => {
  // Hook da biblioteca para controlar a notificação (ex: fechar)
  const { remove } = useNotificationController();
  const styleConfig = notificationStyles[type];

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
        <Ionicons name="close" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    borderLeftWidth: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
});