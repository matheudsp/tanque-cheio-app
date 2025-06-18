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
  Modal,
  FlatList,
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
import type { GasStation } from "@/types/gas-station";

const HEADER_MAX_HEIGHT = 280;

// Componente do Modal para selecionar o combustível a ser favoritado
const FavoriteFuelModal = ({
  isVisible,
  onClose,
  station,
  onToggleFavorite,
  isFavorite,
}: {
  isVisible: boolean;
  onClose: () => void;
  station: GasStation | null;
  onToggleFavorite: (productId: string) => void;
  isFavorite: (stationId: string, productId: string) => boolean;
}) => {
  if (!station) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>Acompanhar Preço</Text>
          <Text style={styles.modalSubtitle}>
            Selecione o combustível para favoritar e receber notificações de
            preço.
          </Text>
          <FlatList
            data={station.fuelPrices}
            keyExtractor={(item) => item.productId}
            style={{ width: "100%" }}
            renderItem={({ item }) => {
              const isFav = isFavorite(station.id, item.productId);
              return (
                <TouchableOpacity
                  style={styles.fuelItem}
                  onPress={() => onToggleFavorite(item.productId)}
                >
                  <Text style={styles.fuelItemText}>{item.productName}</Text>
                  <Ionicons
                    name={isFav ? "heart" : "heart-outline"}
                    size={26}
                    color={isFav ? colors.secondary : colors.primary}
                  />
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

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

  const { addFavorite, unfavoriteProduct, isFavorite, fetchFavorites } =
    useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  
  // Verifica se QUALQUER produto neste posto está favoritado para controlar o ícone do header
  const isAnyProductFavorite =
    selectedStation?.fuelPrices?.some((product) =>
      isFavorite(selectedStation.id, product.productId)
    ) ?? false;

  const handleOpenFavoriteModal = () => {
    if (selectedStation?.fuelPrices?.length) {
      setFavoriteModalVisible(true);
    } else {
      console.warn("Nenhum produto para favoritar neste posto.");
    }
  };

  const handleToggleProductFavorite = (productId: string) => {
    if (!selectedStation) return;

    if (isFavorite(selectedStation.id, productId)) {
      unfavoriteProduct(selectedStation.id, productId);
    } else {
      addFavorite(selectedStation.id, productId);
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
      const { startDate, endDate } = getPeriodDates(selectedPeriod);
      const params: { startDate: string; endDate: string; product?: string } = {
        startDate,
        endDate,
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
        onToggleFavorite={handleToggleProductFavorite}
        isFavorite={isFavorite}
      />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
      >
        <Animated.View style={[styles.contentContainer, cardsAnimatedStyle]}>
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
                ...selectedStation.fuelPrices.map((p) => p.productName),
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
            <Ionicons name="arrow-back" size={24} color={colors.white} />
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
            onPress={handleOpenFavoriteModal}
            style={styles.headerButton}
            disabled={!selectedStation?.fuelPrices?.length}
          >
            <Ionicons
              name={isAnyProductFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isAnyProductFavorite ? colors.secondary : colors.white}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.heroContentContainer, heroContentAnimatedStyle]}
          pointerEvents="box-none"
        >
          <Text style={styles.stationName}>{selectedStation.legal_name}</Text>
          {selectedStation.trade_name && (
            <Text style={styles.tradeName}>{selectedStation.trade_name}</Text>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.white} />
            <Text
              style={styles.heroInfoText}
            >{`${selectedStation.localization.city}, ${selectedStation.localization.state}`}</Text>
          </View>
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
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    zIndex: 1,
    overflow: "hidden",
  },
  topNavContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    width: "100%",
  },
  headerButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 40,
    height: 40,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  heroContentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 20,
  },
  stationName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  tradeName: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 12,
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
  // Estilos para o Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 25,
  },
  fuelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fuelItemText: {
    fontSize: 18,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    marginTop: 25,
    backgroundColor: colors.primaryLight,
    borderRadius: 25,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
});
