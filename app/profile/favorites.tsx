import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useGasStationStore } from "@/store/gasStationStore";
import type { FavoriteStation, Product, GasStation } from "@/types/index";

import { FavoriteFuelModal } from "@/components/shared/FavoriteFuelModal";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatCollectionDate } from "@/utils/formatCollectionDate";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

const PriceTrendBadge = React.memo(
  ({
    trend,
    percentage,
  }: {
    trend: Product["trend"];
    percentage: Product["percentage_change"];
  }) => {
    const percentageValue = percentage;
    const trendInfo = {
      UP: {
        icon: "trending-up" as const,
        color: colors.error,
        text: `${percentageValue}%`,
      },
      DOWN: {
        icon: "trending-down" as const,
        color: colors.success,
        text: `${percentageValue}%`,
      },
      STABLE: {
        icon: "minus" as const,
        color: colors.textSecondary,
        text: "Estável",
      },
    }[trend];
    if (!trendInfo) return null;
    const displayText = trend === "STABLE" ? trendInfo.text : trendInfo.text;
    return (
      <View
        style={[
          styles.badgeContainer,
          { backgroundColor: `${trendInfo.color}20` },
        ]}
      >
        <Feather name={trendInfo.icon} size={16} color={trendInfo.color} />
        <Text style={[styles.badgeText, { color: trendInfo.color }]}>
          {displayText}
        </Text>
      </View>
    );
  }
);

const FavoriteProductRow = React.memo(({ product }: { product: Product }) => {
  const iconName = getIconNameFromFuel(product.product_name);

  return (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <AppIcon name={iconName} width={24} height={24} />
        <View style={styles.productTextContainer}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.lastUpdatedText}>
            {`R$ ${parseFloat(product.price).toFixed(
              2
            )} • ${formatCollectionDate(product.collection_date)}`}
          </Text>
        </View>
      </View>
      <PriceTrendBadge
        trend={product.trend}
        percentage={product.percentage_change}
      />
    </View>
  );
});

const StationFavoritesCard = React.memo(
  ({
    station_data,
    onManage,
    isManaging,
  }: {
    station_data: { station_info: FavoriteStation; products: Product[] };
    onManage: (gas_station_id: string) => void;
    isManaging: boolean;
  }) => {
    const router = useRouter();
    const { station_info, products } = station_data;

    const navigateToDetails = useCallback(() => {
      router.push(`/gas-station/${station_info.gas_station_id}` as any);
    }, [router, station_info.gas_station_id]);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <BrandLogo brandName={station_info.gas_station_brand} />

          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {station_info.gas_station_name}
            </Text>
            <Text
              style={styles.cardAddress}
              numberOfLines={1}
            >{`${station_info.localization.city}, ${station_info.localization.state}`}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToDetails}
            // Prop de acessibilidade para leitores de tela
            accessibilityLabel="Ver detalhes do posto"
            accessibilityRole="button"
          >
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Ver Detalhes</Text>
          </TouchableOpacity>

          <View style={styles.actionSeparator} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onManage(station_info.gas_station_id)}
            disabled={isManaging}
            accessibilityLabel="Gerenciar combustíveis favoritos"
            accessibilityRole="button"
          >
            {isManaging ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Feather name="settings" size={16} color={colors.primary} />
                <Text style={styles.actionButtonText}>Gerenciar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.productsList}>
          {products.map((product, index) => (
            <React.Fragment
              key={`${station_info.gas_station_id}-${product.product_id}`}
            >
              <FavoriteProductRow product={product} />
              {index < products.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  }
);

export default function FavoritesScreen() {
  const { favorites, isLoading, error, fetchFavorites } = useFavoriteStore();
  const {
    fetchStationDetails,
    selectedStation: fetchedStationDetails,
    isDetailsLoading,
  } = useGasStationStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [stationForModal, setStationForModal] = useState<GasStation | null>(
    null
  );
  const [stationIdToManage, setStationIdToManage] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleManageFavorites = useCallback(
    (stationId: string) => {
      setStationIdToManage(stationId); // Define qual posto estamos gerenciando
      fetchStationDetails(stationId); // Dispara a busca pelos detalhes completos
    },
    [fetchStationDetails]
  );

  useEffect(() => {
    if (
      !isDetailsLoading &&
      stationIdToManage &&
      fetchedStationDetails?.id === stationIdToManage
    ) {
      setStationForModal(fetchedStationDetails);
      setModalVisible(true);
      setStationIdToManage(null);
    }
  }, [isDetailsLoading, fetchedStationDetails, stationIdToManage]);

  const onRefresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const groupedFavorites = useMemo(() => {
    const groups: {
      [key: string]: { station_info: FavoriteStation; products: Product[] };
    } = {};

    favorites
      .filter((fav) => fav && fav.product && fav.product.product_id)
      .forEach((fav) => {
        if (!groups[fav.gas_station_id]) {
          groups[fav.gas_station_id] = {
            station_info: fav,
            products: [],
          };
        }
        groups[fav.gas_station_id].products.push(fav.product);
      });

    return Object.values(groups);
  }, [favorites]);

  if (isLoading && favorites.length === 0) return Loading;

  if (error && !isLoading) return <ErrorState onRetry={fetchFavorites} />;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Meus Alertas de Preço",
          headerBackTitle: "Voltar",
        }}
      />

      <FavoriteFuelModal
        isVisible={isModalVisible}
        onClose={() => {
          setModalVisible(false);
          setStationForModal(null);
        }}
        station={stationForModal}
      />

      <FlatList
        data={groupedFavorites}
        renderItem={({ item }) => (
          <StationFavoritesCard
            station_data={item}
            onManage={handleManageFavorites}
            isManaging={
              isDetailsLoading &&
              stationIdToManage === item.station_info.gas_station_id
            }
          />
        )}
        keyExtractor={(item) => item.station_info.gas_station_id}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              fullScreen
              lottieAnimation={require("@/assets/animations/sad-circle.json")}
              title="Nenhum Alerta Ativo"
              description="Monitore um posto para começar a receber notificações."
            />
          ) : null
        }
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
            tintColor={colors.secondary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  listContainer: { paddingHorizontal: 16, paddingVertical: 20, flexGrow: 1 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border + "80",
      },
    }),
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: colors.primary },
  cardAddress: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: `${colors.primary}08`,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionSeparator: {
    width: 1,
    backgroundColor: colors.border,
  },

  productsList: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  productTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  lastUpdatedText: { fontSize: 13, color: colors.textSecondary },
  separator: { height: 1, backgroundColor: colors.border },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  badgeText: { marginLeft: 6, fontSize: 14, fontWeight: "bold" },
});
