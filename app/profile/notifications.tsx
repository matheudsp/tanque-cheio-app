import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Calendar, MessageSquare, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Switch } from 'react-native';

export default function NotificationsScreen() {
  
  
  const [promotions, setPromotions] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Notificações',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
        

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Bell size={24} color={colors.primary} />
              <View style={styles.notificationDetails}>
                <Text style={styles.notificationTitle}>Promoções</Text>
                <Text style={styles.notificationDescription}>
                  Receba alertas de ofertas e descontos
                </Text>
              </View>
            </View>
            <Switch
              value={promotions}
              onValueChange={setPromotions}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={promotions ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <AlertCircle size={24} color={colors.primary} />
              <View style={styles.notificationDetails}>
                <Text style={styles.notificationTitle}>Atualizações do sistema</Text>
                <Text style={styles.notificationDescription}>
                  Fique por dentro de tudo que acontece no app.
                </Text>
              </View>
            </View>
            <Switch
              value={systemUpdates}
              onValueChange={setSystemUpdates}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={systemUpdates ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  notificationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); 