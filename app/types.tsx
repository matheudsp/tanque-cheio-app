import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../constants/colors';

export default function TypesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Types',
          headerShown: true,
        }} 
      />
      <Text style={styles.text}>Types Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
  },
});

// This file can be used for custom type declarations that don't conflict with Expo Router
// Expo Router automatically generates route types in .expo/types/router.d.ts

// Add any custom types that are specific to your app here
export {};
