import { differenceInDays, parseISO } from "date-fns";
import { Clock, MapPin } from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandLogo } from "../ui/BrandLogo";
import { AppIcon } from "@/components/ui/AppIcon";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import type { GasStation, Product } from "@/types";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";
import { useUserStore } from "@/stores/userStore";
import { PaywallModal } from "./PaywallModal";
import { AdOrPremiumModal } from "./AdOrPremiumModal";

type GasStationCardProps = {
  station: GasStation;
  showDistance?: boolean;
  filteredFuel?: string;
  isSelected?: boolean;
};

const getUpdateStatus = (dateString: string | undefined, theme: ThemeState) => {
  if (!dateString)
    return { text: "Sem data", color: theme.colors.text.secondary };
  const daysDiff = differenceInDays(new Date(), parseISO(dateString));
  if (daysDiff <= 15)
    return {
      text: `Atualizado há ${daysDiff} dias`,
      color: theme.colors.success,
    };
  return {
    text: `Atualizado há ${daysDiff} dias`,
    color: theme.colors.warning,
  };
};

export const GasStationCard = ({
  station,
  showDistance = true,
  filteredFuel,
  isSelected,
}: GasStationCardProps) => {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  const { showInterstitialAd } = useInterstitialAd();
  const [isAdOrPremiumModalVisible, setAdOrPremiumModalVisible] =
    useState(false);
  const [isPaywallVisible, setPaywallVisible] = useState(false);
  const { isPremium } = useUserStore();

  const cardData = useMemo(() => {
    const prices = station.fuel_prices || [];
    let heroFuel: Product | null = null;
    let heroLabel = "";
    let otherPricesCount = 0;

    if (filteredFuel) {
      heroFuel =
        prices.find(
          (p) => p.product_name.toUpperCase() === filteredFuel.toUpperCase()
        ) || null;
      heroLabel = heroFuel?.product_name || filteredFuel;
      otherPricesCount = prices.length - (heroFuel ? 1 : 0);
    } else if (prices.length > 0) {
      heroFuel =
        prices.find((p) => p.product_name.toUpperCase().includes("COMUM")) ||
        prices[0];
      heroLabel = heroFuel.product_name;
      otherPricesCount = prices.length - 1;
    }

    const priceText =
      heroFuel?.price && parseFloat(heroFuel.price) > 0
        ? `R$ ${Number(heroFuel.price).toFixed(2).replace(".", ",")}`
        : "N/A";

    const updateStatus = getUpdateStatus(heroFuel?.collection_date, themeState);
    const distanceText = showDistance ? `• ${station.distance!} km` : "";
    const iconName = getIconNameFromFuel(heroFuel?.product_name);

    return {
      heroLabel,
      priceText,
      updateStatus,
      otherPricesCount,
      distanceText,
      iconName,
    };
  }, [station, filteredFuel, showDistance, themeState]);

  const navigateToDetails = () => {
    router.push({
      pathname: "/gas-station/[id]",
      params: { id: station.id },
    } as any);
  };

  const handlePress = () => {
    if (isPremium) {
      navigateToDetails();
    } else {
      setAdOrPremiumModalVisible(true);
    }
  };

  const handleWatchAd = () => {
    setAdOrPremiumModalVisible(false);
    showInterstitialAd({
      onAdDismissed: navigateToDetails,
      onAdFailedToLoad: navigateToDetails,
    });
  };

  const handleGoPremium = () => {
    setAdOrPremiumModalVisible(false);
    setPaywallVisible(true);
  };

  return (
    <>
      <AdOrPremiumModal
        isVisible={isAdOrPremiumModalVisible}
        onClose={() => setAdOrPremiumModalVisible(false)}
        onWatchAd={handleWatchAd}
        onGoPremium={handleGoPremium}
        stationName={station.trade_name || station.legal_name}
      />
      <PaywallModal
        isVisible={isPaywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && { borderColor: themeState.colors.primary.main },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.infoSection}>
          <View style={styles.header}>
            <BrandLogo brandName={station.brand} style={styles.brandLogo} />
            <View style={styles.titleInfo}>
              <Text style={styles.stationName} numberOfLines={1}>
                {station.trade_name || station.legal_name}
              </Text>
              <Text style={styles.stationBrand}>{station.brand}</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={16} color={themeState.colors.text.secondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {station.localization.city} {cardData.distanceText}
            </Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceDetails}>
            <View style={styles.heroLabelContainer}>
              <AppIcon name={cardData.iconName} width={30} height={30} />
              <Text style={styles.heroLabel}>{cardData.heroLabel}</Text>
            </View>
            <View style={styles.updateStatus}>
              <Clock size={12} color={cardData.updateStatus.color} />
              <Text
                style={[
                  styles.updateStatusText,
                  { color: cardData.updateStatus.color },
                ]}
              >
                {cardData.updateStatus.text}
              </Text>
            </View>
          </View>
          <View style={styles.priceValueContainer}>
            <Text
              style={[
                styles.price,
                cardData.priceText === "N/A" && styles.priceNA,
              ]}
            >
              {cardData.priceText}
            </Text>
            {cardData.otherPricesCount > 0 && (
              <Text style={styles.otherPrices}>
                +{cardData.otherPricesCount} outros
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      marginBottom: theme.spacing.lg,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      ...theme.shadows.shadowSm,
    },
    infoSection: {
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    titleInfo: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    stationName: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    stationBrand: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.sm,
    },
    locationText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    priceSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.action.selected,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      borderBottomLeftRadius: theme.borderRadius.large - 1,
      borderBottomRightRadius: theme.borderRadius.large - 1,
    },
    priceDetails: {
      flex: 1,
    },
    heroLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    heroLabel: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      textTransform: "uppercase",
      marginLeft: theme.spacing.sm,
    },
    updateStatus: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 2,
    },
    updateStatusText: {
      marginLeft: theme.spacing.xs,
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    priceValueContainer: {
      alignItems: "flex-end",
    },
    brandLogo: {
      width: 35,
      height: 35,
    },
    price: {
      fontSize: 22,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary.main,
    },
    priceNA: {
      fontSize: 18,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    otherPrices: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
  });
