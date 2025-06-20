import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Moon, Globe, Shield } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function PreferencesScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('Português');
  
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Preferências',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {/* <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Notificações Push</Text>
                <Text style={styles.preferenceDescription}>
                  Receba notificações sobre os postos que segue e atualizações do app
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View> */}
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Moon size={20} color={colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Modo Noturno</Text>
                <Text style={styles.preferenceDescription}>
                  Alterne entre tema claro e escuro
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Globe size={20} color={colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Linguagem</Text>
                <Text style={styles.preferenceDescription}>
                  {language}
                </Text>
              </View>
            </View>
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
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceContent: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
}); 