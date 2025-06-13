import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';

export default function AuthIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/intro.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Explore the world easily</Text>
        <Text style={styles.subtitle}>To your desire</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          variant="primary"
          size="large"
          onPress={() => router.push('/auth/login')}
          style={styles.button}
        />

        <Button
          title="Register"
          variant="secondary"
          size="large"
          onPress={() => router.push('/auth/register')}
          style={styles.button}
        />
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
  buttonContainer: {
    gap: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
}); 