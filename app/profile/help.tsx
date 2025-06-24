import {
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react-native";
import { Stack } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

export default function HelpScreen() {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const faqItems = [
    {
      question: "Como encontro postos de combustível?",
      answer:
        "Para encontrar postos, basta permitir o acesso à sua localização. O mapa mostrará automaticamente os postos mais próximos a você.",
    },
    {
      question: "Os preços são atualizados em tempo real?",
      answer:
        "Os preços são atualizados com frequência com base nas informações mais recentes fornecidas pela ANP - Agência Nacional do Petróleo, Gás Natural e Biocombustíveis.",
    },
    {
      question: "Como posso filtrar os resultados?",
      answer:
        "Na tela do mapa, você pode usar os filtros para obter um resultado objetivo.",
    },
  ];

  const handleContact = (type: string) => {
    switch (type) {
      case "phone":
        Linking.openURL("tel:+5589912345678");
        break;
      case "email":
        Linking.openURL("mailto:suporte@tanquecheio.app");
        break;
      case "chat":
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Ajuda & Suporte",
          headerBackTitle: "Voltar",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <HelpCircle size={20} color={themeState.colors.primary.main} />
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
            onPress={() => handleContact("phone")}
          >
            <Phone size={24} color={themeState.colors.primary.main} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Ligue para nós</Text>
              <Text style={styles.contactDetail}>+55 (89) 91234-5678</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact("email")}
          >
            <Mail size={24} color={themeState.colors.primary.main} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Envie um E-mail</Text>
              <Text style={styles.contactDetail}>suporte@tanquecheio.app</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact("chat")}
          >
            <MessageCircle size={24} color={themeState.colors.primary.main} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat ao Vivo</Text>
              <Text style={styles.contactDetail}>Disponível 24/7</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jurídico</Text>
          <TouchableOpacity style={styles.legalItem}>
            <FileText size={24} color={themeState.colors.primary.main} />
            <Text style={styles.legalText}>Termos de Serviço</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <FileText size={24} color={themeState.colors.primary.main} />
            <Text style={styles.legalText}>Política de Privacidade</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    faqItem: {
      marginBottom: theme.spacing.lg,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    question: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    answer: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginLeft: 28,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    contactInfo: {
      marginLeft: theme.spacing.md,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    contactDetail: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    legalItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    legalText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
    },
  });
