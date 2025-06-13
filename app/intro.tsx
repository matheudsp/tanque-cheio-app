import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function IntroScreen() {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to the next screen in the intro flow, or auth screen
    router.replace('splash' as any); // Or 'auth' or another intro step
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/intro.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Acompanhe os preços</Text>
        <Text style={styles.subtitle}>para manter seu tanque cheio!</Text>
      </View>

      {/* Placeholder for dots and button */}
      <View style={styles.bottomContainer}>
        <View style={styles.paginationDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handlePress}>
          <ChevronRight size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  illustration: {
    width: '100%',
    height: '50%', // Adjust height as needed
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  paginationDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 