import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CreditCard, Plus, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function PaymentScreen() {
  const paymentMethods = [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/24',
      isDefault: true,
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '8888',
      expiry: '09/25',
      isDefault: false,
    },
  ];
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Payment Methods',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethod}>
              <View style={styles.paymentInfo}>
                <CreditCard size={24} color={colors.primary} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.cardType}>{method.type}</Text>
                  <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                  <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
                </View>
              </View>
              
              <View style={styles.paymentActions}>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.deleteButton}>
                  <Trash2 size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    marginLeft: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  defaultText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
}); 