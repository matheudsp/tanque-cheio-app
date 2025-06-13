import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { colors } from '@/constants/colors';

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  // A animação de escala agora começará em 1 e pulsará em torno desse valor.
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    // Define a animação de pulsação que se repetirá em loop.
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        // Aumenta a escala em 5%
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000, // Duração para aumentar
          useNativeDriver: true,
        }),
        // Retorna à escala original
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000, // Duração para diminuir
          useNativeDriver: true,
        }),
      ])
    );

    // Inicia a animação de fade-in (apenas uma vez)
    // e a animação de pulsação (em loop) ao mesmo tempo.
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      pulseAnimation, // Inicia o loop
    ]).start();

    // Função de limpeza para parar a animação quando o componente for desmontado
    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim, // Aplica o fade-in
            transform: [{ scale: scaleAnim }], // Aplica a pulsação
          },
        ]}
      >
        <Image
          source={require('@/assets/images/playstore.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Tanque Cheio</Text>
        <Text style={styles.tagline}>Seu app para manter o tanque cheio!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});