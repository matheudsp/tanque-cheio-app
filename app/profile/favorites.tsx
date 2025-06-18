import React, { useEffect, useCallback } from "react";
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
import type { FavoriteStation, FavoriteProduct } from "@/types/favorites";

// Componente para exibir o indicador de tendência de preço
const PriceTrendBadge = React.memo(
  ({
    trend,
    percentage,
  }: {
    trend: FavoriteProduct["trend"];
    percentage: FavoriteProduct["percentageChange"];
  }) => {
    if (!trend) {
      return null;
    }

    const percentageValue = parseFloat(percentage);

    const trendInfo = {
      UP: {
        icon: "trending-up" as const,
        color: colors.error,
        text: `${percentageValue.toFixed(2)}%`,
      },
      DOWN: {
        icon: "trending-down" as const,
        color: colors.success,
        text: `${percentageValue.toFixed(2)}%`,
      },
      STABLE: {
        icon: "minus" as const,
        color: colors.textSecondary,
        text: "Estável",
      },
    }[trend];
    
    // Não renderiza o badge se não houver tendência definida.
    if (!trendInfo) return null;

    // Se a tendência for estável, não mostra a porcentagem.
    const displayText = trend === "STABLE" ? trendInfo.text : trendInfo.text;

    return (
      <View
        style={[
          styles.badgeContainer,
          // Adiciona um fundo levemente colorido com base na tendência
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

// Componente para exibir um card de produto favorito
const FavoriteProductCard = React.memo(
  ({
    item,
    onUnfavorite,
  }: {
    item: FavoriteStation;
    onUnfavorite: (stationId: string, productId: string) => void;
  }) => {
    const router = useRouter();

    const handlePress = () => {
      router.push(`/gas-station/${item.stationId}`);
    };

    const handleUnfollowClick = () => {
      onUnfavorite(item.stationId, item.product.id);
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        accessible
        accessibilityLabel={`Favorito: ${item.stationName}, produto ${item.product.name}. Preço: R$ ${item.product.price}. Toque para mais detalhes.`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.stationName}</Text>
            <Text style={styles.cardAddress}>
              {`${item.localization.city}, ${item.localization.state}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.followButton}
            onPress={handleUnfollowClick}
            accessible
            accessibilityLabel="Deixar de seguir este produto"
            accessibilityRole="button"
          >
            <Text style={styles.followButtonText}>{"Deixar de seguir"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>{item.product.name}</Text>
            <Text style={styles.priceValue}>
              R$ {parseFloat(item.product.price).toFixed(2)}
            </Text>
          </View>
          {/* --- NOVO COMPONENTE DE TENDÊNCIA ADICIONADO AQUI --- */}
          <PriceTrendBadge
            trend={item.product.trend}
            percentage={item.product.percentageChange}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

// Componente para exibir quando a lista de favoritos está vazia
const EmptyState = React.memo(() => (
  <View style={styles.emptyContainer}>
    <Feather name="star" size={60} color={colors.border} />
    <Text style={styles.emptyTitle}>Nenhum produto favoritado</Text>
    <Text style={styles.emptySubtitle}>
      Quando você favoritar um combustível, ele aparecerá aqui para fácil
      acesso.
    </Text>
  </View>
));

// Tela principal de Favoritos
export default function FavoritesScreen() {
  const { favorites, isLoading, fetchFavorites, unfavoriteProduct } =
    useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (isLoading && favorites.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <FavoriteProductCard item={item} onUnfavorite={unfavoriteProduct} />
        )}
        keyExtractor={(item) => `${item.stationId}-${item.product.id}`}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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

// --- FOLHA DE ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    lineHeight: 22,
  },
  cardAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  followButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", // Alinha preço e badge na base
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  badgeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 500,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 24,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
