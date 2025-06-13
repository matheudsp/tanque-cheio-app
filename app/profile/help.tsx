import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { HelpCircle, MessageCircle, Phone, Mail, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function HelpScreen() {
  const faqItems = [
    {
      question: 'How do I book a driving lesson?',
      answer: 'To book a lesson, go to the Schedule tab and tap the "+" button. Select your preferred date, time, and instructor.',
    },
    {
      question: 'Can I cancel or reschedule a lesson?',
      answer: 'Yes, you can cancel or reschedule lessons up to 24 hours before the scheduled time. Go to the Schedule tab and tap on the lesson you want to modify.',
    },
    {
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked in the Progress tab. You can see your completed lessons, skills, and achievements.',
    },
  ];

  const handleContact = (type: string) => {
    switch (type) {
      case 'phone':
        Linking.openURL('tel:+1234567890');
        break;
      case 'email':
        Linking.openURL('mailto:support@driveable.com');
        break;
      case 'chat':
        // Implement chat functionality
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Help & Support',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <HelpCircle size={20} color={colors.primary} />
                <Text style={styles.question}>{item.question}</Text>
              </View>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
          >
            <Phone size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactDetail}>+1 (234) 567-890</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('email')}
          >
            <Mail size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Us</Text>
              <Text style={styles.contactDetail}>support@driveable.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('chat')}
          >
            <MessageCircle size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactDetail}>Available 24/7</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.legalItem}>
            <FileText size={24} color={colors.primary} />
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <FileText size={24} color={colors.primary} />
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  answer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 28,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  contactDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legalText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
}); 