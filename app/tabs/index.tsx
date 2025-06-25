import { useRouter } from "expo-router";
import { Heart, History } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";

import { GasStationCard } from "@/components/shared/GasStationCard";
import { GasStationCardSkeleton } from "@/components/GasStationCardSkeleton";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useGasStationStore } from "@/store/gasStationStore";
import type { GasStation } from "@/types/gas-stations";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";
import { SafeAreaView } from "react-native-safe-area-context";

// Componente para renderizar os cabeçalhos das seções
const SectionHeader = ({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
}) => {
  const styles = useStylesWithTheme(getStyles);
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.seeAllButton}>Ver todos</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente para exibir quando uma lista está vazia
const EmptyListComponent = ({ message }: { message: string }) => {
  const styles = useStylesWithTheme(getStyles);
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  const {
    favorites,
    fetchFavorites,
    isLoading: isLoadingFavorites,
  } = useFavoriteStore(
    useShallow((state) => ({
      favorites: state.favorites,
      fetchFavorites: state.fetchFavorites,
      isLoading: state.isLoading,
    }))
  );

  // --- ALTERAÇÃO: Busca o histórico de visualizações ---
  const { recentlyViewedStations } = useGasStationStore(
    useShallow((state) => ({
      recentlyViewedStations: state.recentlyViewedStations,
    }))
  );

  const favoriteStations = useMemo(() => {
    const stationsMap = new Map<string, GasStation>();
    favorites.forEach((fav) => {
      const existingStation = stationsMap.get(fav.gas_station_id);
      if (existingStation) {
        existingStation.fuel_prices.push(fav.product);
      } else {
        stationsMap.set(fav.gas_station_id, {
          id: fav.gas_station_id,
          trade_name: fav.gas_station_name,
          legal_name: fav.gas_station_name,
          brand: fav.gas_station_brand,
          localization: fav.localization,
          fuel_prices: [fav.product],
          tax_id: "",
        });
      }
    });
    return Array.from(stationsMap.values());
  }, [favorites]);

  // --- SIMPLIFICAÇÃO: A busca de dados agora é mais direta ---
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const renderStationItem = useCallback(
    ({ item, showDistance }: { item: GasStation; showDistance: boolean }) => (
      <View style={styles.cardWrapper}>
        <GasStationCard station={item} showDistance={showDistance} />
      </View>
    ),
    []
  );

  const renderSkeleton = () => (
    <View style={styles.cardWrapper}>
      <GasStationCardSkeleton />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingFavorites}
            onRefresh={onRefresh}
            tintColor={themeState.colors.primary.main}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá!</Text>
          <Text style={styles.subtitle}>
            Encontre os melhores preços perto de você.
          </Text>
        </View>

        {/* --- Seção de Postos Favoritados (Sem alterações) --- */}
        <View style={styles.section}>
          <SectionHeader
            title="Postos Favoritados"
            icon={<Heart size={20} color={themeState.colors.primary.main} />}
            onPress={() => router.push("/profile/favorites")}
          />
          {isLoadingFavorites ? (
            <FlatList
              data={Array(3).fill(0)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderSkeleton}
              keyExtractor={(_, index) => `fav-skeleton-${index}`}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <FlatList
              data={favoriteStations.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={(props) =>
                renderStationItem({ ...props, showDistance: false })
              }
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <EmptyListComponent message="Você ainda não favoritou nenhum posto." />
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        {/* --- ALTERAÇÃO: Seção de Últimas Buscas agora usa o histórico --- */}
        <View style={styles.section}>
          <SectionHeader
            title="Últimas Buscas"
            icon={<History size={20} color={themeState.colors.primary.main} />}
            onPress={() => router.push("tabs/search")}
          />
          <FlatList
            data={recentlyViewedStations}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={(props) =>
              renderStationItem({ ...props, showDistance: true })
            }
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyListComponent message="Nenhum posto visitado recentemente." />
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilização (sem alterações)
const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
    },
    greeting: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    sectionTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
    },
    seeAllButton: {
      fontSize: 14,
      color: theme.colors.primary.main,
      fontWeight: "600",
    },
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xs,
    },
    cardWrapper: {
      width: 300,
      marginRight: theme.spacing.md,
    },
    emptyContainer: {
      width: 300,
      height: 150,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
  });
