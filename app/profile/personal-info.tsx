import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { User, Mail, Phone, MapPin } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { colors } from '@/constants/colors';

export default function PersonalInfoScreen() {
  const { user } = useUserStore();
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Personal Information',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.infoItem}>
            <User size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{user?.fullName || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Mail size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{user?.phone || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MapPin size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{user?.address || 'Not set'}</Text>
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
}); 