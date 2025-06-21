import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native'; 
import { colors } from '@/constants/colors';

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

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  title,
  description,
  lottieAnimation,
  icon, // Nova prop
  actionLabel,
  onAction,
  fullScreen = false,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.containerFullScreen,
        style,
      ]}
    >
      {/* [MELHORIA] Lógica para renderizar a animação ou o ícone.
          A animação Lottie tem prioridade. */}
      <View style={styles.visualsContainer}>
        {lottieAnimation ? (
          <LottieView
            source={lottieAnimation}
            autoPlay
            loop
            style={styles.lottieView}
          />
        ) : icon ? (
          icon // Renderiza o ícone se não houver animação
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
});

const styles = StyleSheet.create({
  container: {
    
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: 16,
  },
  containerFullScreen: {
    flex: 1,
    margin: 0,
    borderRadius: 0,
    backgroundColor: colors.background,
    justifyContent: 'center', 
  },
  
  visualsContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieView: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});