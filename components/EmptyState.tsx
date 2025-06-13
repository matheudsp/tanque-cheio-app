import React, { memo } from 'react'; // 1. Importar memo para otimização
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle; 
};


export const EmptyState: React.FC<EmptyStateProps> = memo(({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style, 
}) => {
  return (
    
    <View style={[styles.container, style]}>
      {icon && (
        
        <View style={styles.iconWrapper}>
            {icon}
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          variant="primary"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 16, 
    marginVertical: 16,
    
  },
  
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24, 
    marginBottom: 24,
  },
  button: {
    minWidth: 150,
  },
});