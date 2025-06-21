import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGasStationStore } from "@/store/gasStationStore";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { getPeriodDates, type Period } from "@/utils/getPeriodDate";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FuelSelector } from "@/components/FuelSelector";
import { TablePrices } from "@/components/TablePrices";
import { useFavoriteStore } from "@/store/favoriteStore";
import { LinearGradient } from "expo-linear-gradient";
import { Bell } from "lucide-react-native";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { MapPin, Milestone } from "lucide-react-native";
import { FavoriteFuelModal } from "@/components/shared/FavoriteFuelModal";
import { PremiumBadge } from "@/components/ui/PremiumBadge";

const HEADER_MAX_HEIGHT = 360;

export default function GasStationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();

  const HEADER_MIN_HEIGHT = top + 60;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [selectedProduct, setSelectedProduct] = useState<string>("TODOS");
  const [isFavoriteModalVisible, setFavoriteModalVisible] = useState(false);

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
  } = useGasStationStore();

  const { isFavorite, fetchFavorites } =
    useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleOpenFavoriteModal = () => {
    if (selectedStation?.fuel_prices?.length) {
      setFavoriteModalVisible(true);
    } else {
      console.warn("Nenhum produto para favoritar neste posto.");
    }
  };



  const scrollY = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    if (id) fetchStationDetails(id);
    return () => clearSelectedStation();
  }, [id, fetchStationDetails]);

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
  }, [isDetailsLoading, selectedStation]);

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

  const handleGetDirections = () => {
    if (!selectedStation?.localization?.coordinates?.coordinates) {
      return;
    }
    const [longitude, latitude] =
      selectedStation.localization.coordinates.coordinates;
    const label = encodeURIComponent(selectedStation.legal_name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Não foi possível abrir o app de mapas", err)
      );
    }
  };

  const handleRetry = () => {
    if (id) {
      clearError();
      fetchStationDetails(id);
    }
  };

  if (isDetailsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Ocorreu um Erro</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Tentar Novamente"
          onPress={handleRetry}
          color={colors.primary}
        />
      </View>
    );
  }
  if (!selectedStation) {
    return null;
  }

  return (
    <View style={styles.container}>
     <FavoriteFuelModal
        isVisible={isFavoriteModalVisible}
        onClose={() => setFavoriteModalVisible(false)}
        station={selectedStation}
       
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
              colors={[ colors.secondary ,colors.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumButton}
            >
              <View style={styles.premiumButtonContent}>
                <Bell
                  size={20}
                  color={colors.white}
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
              {(["week", "month", "semester"] as Period[]).map((period) => (
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
                    {period === "week"
                      ? "7d"
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
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
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
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.heroContentContainer, heroContentAnimatedStyle]}
          pointerEvents="box-none"
        >
          {/* GRUPO 1: IDENTIDADE DO POSTO (LOGO + NOMES) */}
          <View style={styles.identityContainer}>
            <BrandLogo
              brandName={selectedStation.brand}
              style={styles.brandLogo}
            />
            {/* A View foi removida, o Text agora é filho direto */}
            <Text style={styles.stationName} numberOfLines={2}>
              {selectedStation.trade_name || selectedStation.legal_name}
            </Text>
          </View>

          {/* GRUPO 2: INFORMAÇÕES RÁPIDAS (STATS EM PILLS) */}
          <View style={styles.statsContainer}>
            {/* {selectedStation.distance && (
              <View style={styles.statPill}>
                <Milestone
                  size={14}
                  color={colors.white}
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>
                  Aprox. {`${selectedStation.distance.toFixed(1)} km`}
                </Text>
              </View>
            )} */}
            <View style={styles.statPill}>
              <MapPin size={14} color={colors.white} style={styles.statIcon} />
              <Text style={styles.statText}>
                {`${selectedStation.localization.address}, ${selectedStation.localization.number}`}
              </Text>
            </View>
          </View>

          {/* GRUPO 3: ENDEREÇO COMPLETO */}
          <Text style={styles.fullAddressText}>
            {`${selectedStation.localization.neighborhood}, ${
              selectedStation.localization.city
            } - ${selectedStation.localization.state.substring(0, 2)}`}
          </Text>

          {/* GRUPO 4: BOTÃO DE AÇÃO PRINCIPAL */}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Ionicons
              name="navigate-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.directionsButtonText}>Traçar Rota</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 4,
    marginBottom: 12,
  },

  stationName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 2,
    textAlign: "center",
  },

  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statIcon: {
    marginRight: 6,
  },
  statText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "500",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
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

    marginBottom: 12,
  },

  statsContainer: {
    flexDirection: "row",

    marginBottom: 10,
    gap: 10,
  },

  fullAddressText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    width: "100%",
    textAlign: "center",
    marginBottom: 16,
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
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 16,
  },
  premiumButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumButtonIcon: {
    marginRight: 10,
  },
  premiumButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  heroInfoText: { marginLeft: 8, fontSize: 16, color: colors.white },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  directionsButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  contentContainer: { padding: 20, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: "transparent",
  },
  filterButtonText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: colors.white,
  },
});
