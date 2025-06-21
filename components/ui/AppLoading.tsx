import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

interface AppLoadingProps {
  /** Mensagem opcional a ser exibida. */
  message?: string;
  /** Se `true`, o componente ocupará a tela inteira. Se `false`, ocupará o espaço do seu container pai.
   * @default true
   */
  fullScreen?: boolean;
  /** Controla o tamanho do logo e do indicador.
   * @default 'large'
   */
  size?: 'small' | 'large';
  /** Permite passar estilos customizados para o container principal. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de carregamento reutilizável e personalizável.
 * Pode ser usado em tela cheia ou de forma contida (inline).
 */
export const AppLoading: React.FC<AppLoadingProps> = ({
  message,
  fullScreen = true, // Valor padrão para manter o comportamento original
  size = 'large',
  style,
}) => {
  // --- Animação ---
  const scale = useSharedValue(1);
  React.useEffect(() => {
    const animationFactor = size === 'large' ? 1.05 : 1.02; // Animação mais sutil para o tamanho pequeno
    scale.value = withRepeat(
      withSequence(
        withTiming(animationFactor, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1, true
    );
  }, [scale, size]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // --- Estilos Dinâmicos ---
  const logoSize = size === 'large' ? 100 : 50;
  const messageFontSize = size === 'large' ? 16 : 13;

  return (
    <View style={[
      styles.containerBase,
      fullScreen && styles.containerFullScreen, // Aplica o estilo de tela cheia condicionalmente
      style // Permite sobrescrever com estilos customizados
    ]}>
      <Animated.View style={animatedLogoStyle}>
        <Image
          source={require('@/assets/images/playstore.png')}
          style={[styles.logo, { width: logoSize, height: logoSize }]}
        />
      </Animated.View>

      <ActivityIndicator
        size={size} // Usa a propriedade 'size'
        color={colors.secondary}
        style={styles.spinner}
      />
      
      {message && (
        <Text style={[styles.message, { fontSize: messageFontSize }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilos base que se aplicam a ambos os modos
  containerBase: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20, // Padding para o modo inline
  },
  // Estilo específico para o modo tela cheia
  containerFullScreen: {
    flex: 1,
  },
  logo: {
    borderRadius: 20,
    marginBottom: 24,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  message: {
    marginTop: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});