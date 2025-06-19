import React, { useEffect, useMemo, useCallback } from "react";
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
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useFavoriteStore } from "@/store/favoriteStore";
import type { FavoriteStation, Product } from "@/types/index";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// UTILITY: Função para formatar a data de atualização
const formatLastUpdated = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch (error) {
    return "Data inválida";
  }
};

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

const EmptyState = React.memo(() => (
  <View style={styles.feedbackContainer}>
    <Feather name="star" size={60} color={colors.border} />
    <Text style={styles.feedbackTitle}>Nenhum produto favoritado</Text>
    <Text style={styles.feedbackSubtitle}>
      Quando você favoritar um combustível, ele aparecerá aqui.
    </Text>
  </View>
));

const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.feedbackContainer}>
    <Feather name="alert-circle" size={60} color={colors.error} />
    <Text style={styles.feedbackTitle}>Erro ao carregar favoritos</Text>
    <Text style={styles.feedbackSubtitle}>
      Não foi possível buscar seus dados. Verifique sua conexão e tente
      novamente.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Tentar Novamente</Text>
    </TouchableOpacity>
  </View>
));

const FavoriteProductRow = React.memo(
  ({
    product,
    on_unfavorite,
    gas_station_id,
  }: {
    product: Product;
    on_unfavorite: (gas_station_id: string, product_id: string) => void;
    gas_station_id: string;
  }) => {
    return (
      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.lastUpdatedText}>
            {`R$ ${parseFloat(product.price).toFixed(2)} • ${formatLastUpdated(
              product.collection_date
            )}`}
          </Text>
        </View>
        <View style={styles.productActions}>
          <PriceTrendBadge
            trend={product.trend}
            percentage={product.percentage_change}
          />
          <TouchableOpacity
            onPress={() => on_unfavorite(gas_station_id, product.product_id)}
            style={styles.unfollowIcon}
          >
            <Feather name="x-circle" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const StationFavoritesCard = React.memo(
  ({
    station_data,
    on_unfavorite,
  }: {
    station_data: { station_info: FavoriteStation; products: Product[] };
    on_unfavorite: (gas_station_id: string, product_id: string) => void;
  }) => {
    const router = useRouter();
    const { station_info, products } = station_data;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => router.push(`/gas-station/${station_info.gas_station_id}` as any)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{station_info.gas_station_name}</Text>
            <Text
              style={styles.cardAddress}
            >{`${station_info.localization.city}, ${station_info.localization.state}`}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.productsList}>
          {products.map((product, index) => (
            <React.Fragment
              key={`${station_info.gas_station_id}-${product.product_id}`}
            >
              <FavoriteProductRow
                product={product}
                gas_station_id={station_info.gas_station_id}
                on_unfavorite={on_unfavorite}
              />
              {index < products.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  }
);

// --- TELA PRINCIPAL ---

export default function FavoritesScreen() {
  const { favorites, isLoading, error, fetchFavorites, unfavoriteProduct } =
    useFavoriteStore();
  
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  const onRefresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Lógica para agrupar favoritos por posto de gasolina
  const groupedFavorites = useMemo(() => {
    const groups: {
      [key: string]: { station_info: FavoriteStation; products: Product[] };
    } = {};
    
    favorites
      .filter(fav => fav && fav.product && fav.product.product_id)
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

  // --- RENDERIZAÇÃO CONDICIONAL (LOADING, ERROR, EMPTY, DATA) ---

  if (isLoading && favorites.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (error && !isLoading) {
    return <ErrorState onRetry={fetchFavorites} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={groupedFavorites}
        renderItem={({ item }) => (
          <StationFavoritesCard
            station_data={item}
            on_unfavorite={unfavoriteProduct}
          />
        )}
        keyExtractor={(item) => item.station_info.gas_station_id}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContainer: { paddingHorizontal: 16, paddingVertical: 20, flexGrow: 1 },
  feedbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 24,
    textAlign: "center",
  },
  feedbackSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: { color: colors.white, fontWeight: "bold", fontSize: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: colors.primary },
  cardAddress: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  productsList: { paddingHorizontal: 16 },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  productInfo: { flex: 1, marginRight: 8 },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  lastUpdatedText: { fontSize: 13, color: colors.textSecondary },
  productActions: { flexDirection: "row", alignItems: "center" },
  unfollowIcon: { marginLeft: 12 },
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