import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { FavoriteFuelModal } from "@/components/shared/FavoriteFuelModal";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AppIcon } from "@/components/ui/AppIcon";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useGasStationStore } from "@/stores/gasStationStore";
import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";
import type { FavoriteStation, GasStation, Product } from "@/types/index";
import { formatCollectionDate } from "@/utils/formatCollectionDate";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";

const PriceTrendBadge = React.memo(
  ({
    trend,
    percentage,
    theme,
    styles,
  }: {
    trend: Product["trend"];
    percentage: Product["percentage_change"];
    theme: ThemeState;
    styles: any;
  }) => {
    const trendInfo = useMemo(() => {
      const percentageValue = percentage;
      return {
        UP: {
          icon: "trending-up" as const,
          color: theme.colors.error,
          text: `${percentageValue}%`,
        },
        DOWN: {
          icon: "trending-down" as const,
          color: theme.colors.success,
          text: `${percentageValue}%`,
        },
        STABLE: {
          icon: "minus" as const,
          color: theme.colors.text.secondary,
          text: "Estável",
        },
      }[trend];
    }, [trend, percentage, theme]);

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

const FavoriteProductRow = React.memo(
  ({
    product,
    theme,
    styles,
  }: {
    product: Product;
    theme: ThemeState;
    styles: any;
  }) => {
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
          theme={theme}
          styles={styles}
        />
      </View>
    );
  }
);

const StationFavoritesCard = React.memo(
  ({
    station_data,
    onManage,
    isManaging,
    theme,
    styles,
  }: {
    station_data: { station_info: FavoriteStation; products: Product[] };
    onManage: (gas_station_id: string) => void;
    isManaging: boolean;
    theme: ThemeState;
    styles: any;
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
            accessibilityLabel="Ver detalhes do posto"
            accessibilityRole="button"
          >
            <Feather name="info" size={16} color={theme.colors.primary.main} />
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
              <ActivityIndicator
                size="small"
                color={theme.colors.primary.main}
              />
            ) : (
              <>
                <Feather
                  name="settings"
                  size={16}
                  color={theme.colors.primary.main}
                />
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
              <FavoriteProductRow
                product={product}
                theme={theme}
                styles={styles}
              />
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

  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

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
      setStationIdToManage(stationId);
      fetchStationDetails(stationId);
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

  if (isLoading && favorites.length === 0) return <Loading />;
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
            styles={styles}
            theme={themeState}
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
            colors={[themeState.colors.secondary.main]}
            tintColor={themeState.colors.secondary.main}
          />
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    listContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      flexGrow: 1,
    },
    card: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
          borderWidth: 1,
          borderColor: theme.colors.border + "80",
        },
      }),
    },
    cardHeader: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
    },
    cardHeaderInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary.main,
    },
    cardAddress: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    cardActions: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      backgroundColor: theme.colors.action.selected,
    },
    actionButtonText: {
      marginLeft: theme.spacing.sm,
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primary.main,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    actionSeparator: {
      width: 1,
      backgroundColor: theme.colors.divider,
    },
    productsList: {
      paddingHorizontal: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
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
      marginRight: theme.spacing.sm,
    },
    productTextContainer: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    lastUpdatedText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    badgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.round,
    },
    badgeText: {
      marginLeft: 6,
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
