import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { HelpCircle, MessageCircle, Phone, Mail, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function HelpScreen() {
  const faqItems = [
    {
      question: 'Como encontro postos de combustível?',
      answer: 'Para encontrar postos, basta permitir o acesso à sua localização. O mapa mostrará automaticamente os postos mais próximos a você.',
    },
    {
      question: 'Os preços são atualizados em tempo real?',
      answer: 'Os preços são atualizados com frequência com base nas informações mais recentes fornecidas pela ANP - Agência Nacional do Petróleo, Gás Natural e Biocombustíveis.',
    },
    {
      question: 'Como posso filtrar os resultados?',
      answer: 'Na tela do mapa, você pode usar os filtros para obter um resultado objetivo.',
    },
  ];

  const handleContact = (type: string) => {
    switch (type) {
      case 'phone':
        // Adapte o número de telefone para o seu suporte
        Linking.openURL('tel:+5589912345678');
        break;
      case 'email':
        Linking.openURL('mailto:atendimentoaocliente@valedosol');
        break;
      case 'chat':
        // Implementar funcionalidade de chat
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Ajuda & Suporte',
          headerBackTitle: 'Voltar',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
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
          <Text style={styles.sectionTitle}>Fale Conosco</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
          >
            <Phone size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Ligue para nós</Text>
              <Text style={styles.contactDetail}>+55 (89) 91234-5678</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('email')}
          >
            <Mail size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Envie um E-mail</Text>
              <Text style={styles.contactDetail}>suporte@tanquecheio.com.br</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('chat')}
          >
            <MessageCircle size={24} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat ao Vivo</Text>
              <Text style={styles.contactDetail}>Disponível 24/7</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jurídico</Text>
          <TouchableOpacity style={styles.legalItem}>
            <FileText size={24} color={colors.primary} />
            <Text style={styles.legalText}>Termos de Serviço</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <FileText size={24} color={colors.primary} />
            <Text style={styles.legalText}>Política de Privacidade</Text>
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