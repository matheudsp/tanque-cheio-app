import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
// Adicionar o ícone de escudo para o selo de confiança
import { ArrowRight, CheckCircle, ShieldCheck, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';

import { usePurchases } from '@/providers/purchasesProvider';
import { useTheme } from '@/providers/themeProvider';
import { useStylesWithTheme } from '@/hooks/useStylesWithTheme';
import type { ThemeState } from '@/types/theme';
import { SubscriptionBadge } from '../ui/SubscriptionBadge';

interface PaywallModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const premiumFeatures = [
  'Monitore preços e receba alertas ilimitados',
  'Acesso antecipado a novos recursos',
  'Experiência livre de anúncios',
  'Ajude no desenvolvimento do projeto',
];

export const PaywallModal = ({ isVisible, onClose }: PaywallModalProps) => {
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  const { offerings, purchasePackage, restorePurchases, isLoading } =
    usePurchases();

  // Componente de botão de compra refatorado para ser mais persuasivo
  const PurchaseButton = ({ pkg }: { pkg: PurchasesPackage }) => {
    const isAnnual = offerings?.annual?.identifier === pkg.identifier;

    // O plano anual (melhor valor) se torna o CTA primário
    if (isAnnual) {
      return (
        <TouchableOpacity
          style={styles.ctaButtonPrimary}
          onPress={() => purchasePackage(pkg)}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={themeState.colors.primary.text} />
          ) : (
            <>
              <View>
                <Text style={styles.ctaButtonTitlePrimary}>
                  {pkg.product.title}
                </Text>
                <Text style={styles.ctaButtonSubtitlePrimary}>
                  Economize com o plano anual
                </Text>
              </View>
              <Text style={styles.ctaButtonPricePrimary}>
                {pkg.product.priceString}
              </Text>
            </>
          )}
           <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>MELHOR VALOR</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Outros planos (ex: mensal) são opções secundárias
    return (
      <TouchableOpacity
        style={styles.ctaButtonSecondary}
        onPress={() => purchasePackage(pkg)}
        disabled={isLoading}>
         {isLoading ? (
            <ActivityIndicator color={themeState.colors.primary.main} />
          ) : (
             <>
                <Text style={styles.ctaButtonTitleSecondary}>{pkg.product.title}</Text>
                <Text style={styles.ctaButtonPriceSecondary}>{pkg.product.priceString}</Text>
             </>
          )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="formSheet">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={28} color={themeState.colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.heroContainer}>
            <Text style={styles.title}>Seja um Usuário Premium</Text>
            <Text style={styles.subtitle}>
              Evolua sua experiência e desbloqueie todos os recursos.
            </Text>
            <View style={styles.upgradePathContainer}>
              <SubscriptionBadge />
              <ArrowRight
                size={24}
                color={themeState.colors.text.secondary}
                style={styles.arrow}
              />
              <SubscriptionBadge isPremium />
            </View>
          </View>

          <View style={styles.featuresContainer}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={20} color={themeState.colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* SEÇÃO DE PLANOS (CTA) REFATORADA */}
          <View style={styles.packagesContainer}>
            {offerings?.availablePackages
              // Garante que o plano anual apareça primeiro
              .sort((a) => (a.identifier.includes('annual') ? -1 : 1))
              .map(pkg => (
                <PurchaseButton key={pkg.identifier} pkg={pkg} />
              ))}
          </View>

           {/* SELOS DE CONFIANÇA */}
          <View style={styles.trustContainer}>
            <ShieldCheck size={18} color={themeState.colors.text.secondary} />
            <Text style={styles.trustText}>
              Pagamento seguro via App Store / Google Play. Cancele quando quiser.
            </Text>
          </View>

        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity onPress={restorePurchases} disabled={isLoading}>
            <Text style={styles.restoreText}>Restaurar Compras</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ESTILOS ATUALIZADOS
const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    scrollContent: { padding: theme.spacing.lg, paddingBottom: 100 },
    closeButton: { alignSelf: 'flex-end', padding: theme.spacing.xs },
    heroContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    upgradePathContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.paper,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    arrow: {
      marginHorizontal: theme.spacing.lg,
    },
    featuresContainer: {
      marginBottom: theme.spacing.xl,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    packagesContainer: { marginTop: theme.spacing.lg, paddingHorizontal: theme.spacing.sm },
    // Estilo para o botão de compra primário (Anual)
    ctaButtonPrimary: {
      backgroundColor: theme.colors.secondary.main, // Laranja vibrante
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflow: 'hidden',
      shadowColor: theme.colors.secondary.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    ctaButtonTitlePrimary: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.secondary.text,
    },
     ctaButtonSubtitlePrimary: {
      fontSize: 14,
      color: theme.colors.secondary.text,
      opacity: 0.9,
    },
    ctaButtonPricePrimary: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.secondary.text,
    },
    // Estilo para o botão de compra secundário (Mensal)
    ctaButtonSecondary: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      borderWidth: 2,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ctaButtonTitleSecondary:{
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    ctaButtonPriceSecondary:{
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    bestValueBadge: {
      position: 'absolute',
      top: -1,
      right: 12,
      backgroundColor: theme.colors.secondary.dark,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 3,
      borderBottomLeftRadius: theme.borderRadius.medium,
      borderBottomRightRadius: theme.borderRadius.medium,
    },
    bestValueText: {
      color: theme.colors.secondary.text,
      fontSize: 10,
      fontWeight: 'bold',
    },
    // Estilos para os selos de confiança
    trustContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    trustText: {
      marginLeft: theme.spacing.sm,
      fontSize: 12,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    footer: {
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      borderTopWidth: 1,
      borderColor: theme.colors.divider,
      backgroundColor: theme.colors.background.default
    },
    restoreText: {
      color: theme.colors.primary.main,
      fontSize: 16,
      fontWeight: '500',
    },
  });
