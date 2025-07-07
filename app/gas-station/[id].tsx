import { Bell, MapPin } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { ChartSkeleton } from "@/components/ChartSkeleton";
import { FuelSelector } from "@/components/FuelSelector";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { FavoriteFuelModal } from "@/components/shared/FavoriteFuelModal";
import { TablePrices } from "@/components/TablePrices";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useGasStationStore } from "@/stores/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import { getPeriodDates, type Period } from "@/utils/getPeriodDate";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useUserStore } from "@/stores/userStore";
import { PaywallModal } from "@/components/shared/PaywallModal";
import { useShallow } from "zustand/react/shallow";
import { toast } from "@/hooks/useToast";
import { useActionSheet } from "@expo/react-native-action-sheet";
const HEADER_MAX_HEIGHT = 360;

export default function GasStationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const HEADER_MIN_HEIGHT = top + 60;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [selectedProduct, setSelectedProduct] = useState<string>("TODOS");
  const [isFavoriteModalVisible, setFavoriteModalVisible] = useState(false);
  const [isPaywallVisible, setPaywallVisible] = useState(false);
  const {
    selectedStation,
    priceHistory,
    isDetailsLoading,
    isHistoryLoading,
    error,
    fetchStationDetails,
    fetchPriceHistory,
    clearSelectedStation,
    clearError,
  } = useGasStationStore(
    useShallow((state) => ({
      selectedStation: state.selectedStation,
      isDetailsLoading: state.isDetailsLoading,
      error: state.error,
      fetchStationDetails: state.fetchStationDetails,
      clearSelectedStation: state.clearSelectedStation,
      clearError: state.clearError,
      fetchPriceHistory: state.fetchPriceHistory,
      priceHistory: state.priceHistory,
      isHistoryLoading: state.isHistoryLoading,
    }))
  );
  const { isPremium } = useUserStore();
  const { fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleOpenFavoriteModal = () => {
    if (isPremium) {
      if (selectedStation?.fuel_prices?.length) {
        setFavoriteModalVisible(true);
      }
    } else {
      setPaywallVisible(true);
    }
  };

  const scrollY = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    if (id) fetchStationDetails(id);
    return () => clearSelectedStation();
  }, [id, fetchStationDetails, clearSelectedStation]);

  useEffect(() => {
    if (id) {
      const { start_date, end_date } = getPeriodDates(selectedPeriod);
      const params: { start_date: string; end_date: string; product?: string } =
        {
          start_date,
          end_date,
        };
      if (selectedProduct !== "TODOS") {
        params.product = selectedProduct;
      }
      fetchPriceHistory(id, params);
    }
  }, [id, selectedPeriod, selectedProduct, fetchPriceHistory]);

  useEffect(() => {
    if (!isDetailsLoading && selectedStation) {
      contentOpacity.value = withTiming(1, { duration: 500 });
      contentTranslateY.value = withTiming(0, { duration: 500 });
    }
  }, [isDetailsLoading, selectedStation, contentOpacity, contentTranslateY]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      "clamp"
    ),
  }));

  const heroContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      "clamp"
    ),
  }));

  const collapsedHeaderContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
      [0, 1],
      "clamp"
    ),
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleRetry = () => {
    if (id) {
      clearError();
      fetchStationDetails(id);
    }
  };

  const getDirections = useCallback(() => {
    if (!selectedStation?.localization) {
      toast.error({
        title: "Erro",
        description: "Endereço do posto não encontrado.",
      });
      return;
    }

    const { address, number, neighborhood, city, state } =
      selectedStation.localization;
    const addressString = `${address}, ${number} - ${neighborhood}, ${city}, ${state}`;
    const encodedAddress = encodeURIComponent(addressString);

    const mapApps = [
      {
        name: "Google Maps",
        url: `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`,
        webUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
      },
      {
        name: "Waze",
        url: `waze://?q=${encodedAddress}&navigate=yes`,
        webUrl: `https://waze.com/ul?q=${encodedAddress}`,
      },
    ];

    if (Platform.OS === "ios") {
      mapApps.push({
        name: "Apple Maps",
        url: `http://maps.apple.com/?daddr=${encodedAddress}`,
        webUrl: `http://maps.apple.com/?daddr=${encodedAddress}`,
      });
    }

    const options = [...mapApps.map((app) => app.name), "Cancelar"];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: "Traçar Rota",
        message: "Escolha seu app de navegação preferido.",
        tintColor: themeState.colors.primary.main,
        titleTextStyle: styles.actionSheetTitle,
        messageTextStyle: styles.actionSheetMessage,
      },
      (selectedIndex?: number) => {
        if (
          selectedIndex === undefined ||
          selectedIndex === cancelButtonIndex
        ) {
          return; // Usuário cancelou
        }

        const selectedApp = mapApps[selectedIndex];
        Linking.openURL(selectedApp.url).catch(() => {
          Linking.openURL(selectedApp.webUrl); // Tenta abrir a URL web como fallback
        });
      }
    );
  }, [selectedStation, showActionSheetWithOptions, themeState, styles]);

  if (isDetailsLoading) return <Loading />;

  if (error || !selectedStation) return <ErrorState onRetry={handleRetry} />;

  return (
    <View style={styles.container}>
      <FavoriteFuelModal
        isVisible={isFavoriteModalVisible}
        onClose={() => setFavoriteModalVisible(false)}
        station={selectedStation}
      />
      <PaywallModal
        isVisible={isPaywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
      >
        <Animated.View style={[styles.contentContainer, cardsAnimatedStyle]}>
          <TouchableOpacity
            onPress={handleOpenFavoriteModal}
            disabled={!selectedStation?.fuel_prices?.length}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                themeState.colors.secondary.main,
                themeState.colors.warning,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumButton}
            >
              <View style={styles.premiumButtonContent}>
                <Bell
                  size={20}
                  color={themeState.colors.secondary.text}
                  style={styles.premiumButtonIcon}
                />
                <Text style={styles.premiumButtonText}>
                  Ativar Alertas de Preço
                </Text>
              </View>
              <PremiumBadge />
            </LinearGradient>
          </TouchableOpacity>
          <TablePrices selectedStation={selectedStation} />
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico de Preços</Text>
            <Text style={styles.filterLabel}>Período</Text>
            <View style={styles.filterContainer}>
              {(["month", "semester", "year"] as Period[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.filterButton,
                    selectedPeriod === period && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedPeriod === period &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {period === "year"
                      ? "1a"
                      : period === "month"
                      ? "30d"
                      : "6m"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterLabel}>Combustível</Text>
            <FuelSelector
              options={[
                "TODOS",
                ...selectedStation.fuel_prices.map((p) => p.product_name),
              ]}
              selectedValue={selectedProduct}
              onSelect={setSelectedProduct}
            />
            {isHistoryLoading ? (
              <ChartSkeleton />
            ) : (
              <PriceHistoryChart
                priceHistory={priceHistory}
                selectedProduct={selectedProduct}
              />
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <View
          style={[
            styles.topNavContainer,
            { height: HEADER_MIN_HEIGHT, paddingTop: top },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.replace("..")}
            style={styles.headerButton}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={themeState.colors.primary.text}
            />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.collapsedTitleContainer,
              collapsedHeaderContentStyle,
            ]}
          >
            <Text style={styles.collapsedTitle} numberOfLines={1}>
              {selectedStation.trade_name || selectedStation.legal_name}
            </Text>
          </Animated.View>
          <TouchableOpacity
            style={styles.headerButton}
            disabled={!selectedStation?.id}
          >
            <Ionicons
              name={"ellipsis-vertical"}
              size={18}
              color={themeState.colors.primary.text}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.heroContentContainer, heroContentAnimatedStyle]}
          pointerEvents="box-none"
        >
          <View style={styles.identityContainer}>
            <BrandLogo
              brandName={selectedStation.brand}
              style={styles.brandLogo}
            />
            <Text style={styles.stationName} numberOfLines={2}>
              {selectedStation.trade_name || selectedStation.legal_name}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statPill}>
              <MapPin
                size={14}
                color={themeState.colors.primary.text}
                style={styles.statIcon}
              />
              <Text style={styles.statText}>
                {`${selectedStation.localization.address}, ${selectedStation.localization.number}`}
              </Text>
            </View>
          </View>
          <Text style={styles.fullAddressText}>
            {`${selectedStation.localization.neighborhood}, ${
              selectedStation.localization.city
            } - ${selectedStation.localization.state.substring(0, 2)}`}
          </Text>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={getDirections}
          >
            <Ionicons
              name="navigate-outline"
              size={22}
              color={themeState.colors.primary.main}
            />
            <Text style={styles.directionsButtonText}>Traçar Rota</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.default,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    brandLogo: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.background.paper,
      padding: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    stationName: {
      fontSize: 22,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary.text,
      marginBottom: theme.spacing.xs,
      textAlign: "center",
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.action.hover,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.round,
    },
    statIcon: {
      marginRight: theme.spacing.xs,
    },
    statText: {
      color: theme.colors.primary.text,
      fontSize: 13,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.primary.main,
      zIndex: 1,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    topNavContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      width: "100%",
    },
    heroContentContainer: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    identityContainer: {
      flexDirection: "column",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      flexDirection: "row",
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    fullAddressText: {
      color: theme.colors.primary.text + "E6",
      fontSize: 14,
      width: "100%",
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    headerButton: {
      backgroundColor: "rgba(0,0,0,0.3)",
      width: 38,
      height: 38,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    collapsedTitleContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    collapsedTitle: {
      color: theme.colors.primary.text,
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    premiumButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: theme.borderRadius.large,
      paddingVertical: 14,
      paddingHorizontal: 16,
      ...theme.shadows.shadowMd,
      marginBottom: theme.spacing.lg,
    },
    premiumButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    premiumButtonIcon: {
      marginRight: theme.spacing.sm,
    },
    premiumButtonText: {
      color: theme.colors.secondary.text,
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
    },
    directionsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background.paper,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: theme.borderRadius.round,
      ...theme.shadows.shadowMd,
    },
    directionsButtonText: {
      color: theme.colors.primary.main,
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      marginLeft: theme.spacing.sm,
    },
    contentContainer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background.default,
    },
    card: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      marginLeft: 4,
    },
    filterContainer: {
      flexDirection: "row",
      marginBottom: theme.spacing.xl,
    },
    filterButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.background.default,
      marginHorizontal: 4,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary.main,
      borderColor: "transparent",
    },
    filterButtonText: {
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    filterButtonTextActive: {
      color: theme.colors.primary.text,
    },
    actionSheetTitle: {
      color: theme.colors.text.primary,
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    actionSheetMessage: {
      color: theme.colors.text.secondary,
      fontSize: 13,
    },
  });
