import { useRouter } from "expo-router";
import { Heart, History } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import { GasStationCard } from "@/components/shared/GasStationCard";
import { GasStationCardSkeleton } from "@/components/GasStationCardSkeleton";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useGasStationStore } from "@/stores/gasStationStore";
import type { GasStation } from "@/types/gas-stations";
import type { ThemeState } from "@/types/theme";
import { useTheme } from "@/providers/themeProvider";
import { useUserStore } from "@/stores/userStore";

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
  const { user } = useUserStore();
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

  const { recentlyViewedStations } = useGasStationStore(
    useShallow((state) => ({
      recentlyViewedStations: state.recentlyViewedStations,
    }))
  );

  const favoriteStations = useMemo(() => {
    const stationsMap = new Map<string, GasStation>();

    favorites.forEach((fav) => {
      if (!fav || !fav.gas_station_id || !fav.product) return;

      const existingStation = stationsMap.get(fav.gas_station_id);

      if (existingStation) {
        existingStation.fuel_prices.push(fav.product);
      } else {
        const newStation: GasStation = {
          id: fav.gas_station_id,
          trade_name: fav.gas_station_name,
          legal_name: fav.gas_station_name,
          brand: fav.gas_station_brand,
          localization: fav.localization,
          fuel_prices: [fav.product],
          tax_id: "",
        };
        stationsMap.set(fav.gas_station_id, newStation);
      }
    });
    return Array.from(stationsMap.values());
  }, [favorites]);

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
            tintColor={themeState.colors.secondary.main}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {user?.name}</Text>
          <Text style={styles.subtitle}>
            Encontre os melhores preços perto de você.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Postos Favoritados"
            icon={<Heart size={20} color={themeState.colors.primary.main} />}
            onPress={() => router.push("/profile/favorites")}
          />
          {isLoadingFavorites ? (
            <FlashList
              data={Array(3).fill(0)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderSkeleton}
              keyExtractor={(_, index) => `fav-skeleton-${index}`}
              contentContainerStyle={styles.listContent}
              estimatedItemSize={5}
            />
          ) : (
            <FlashList
              data={favoriteStations.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={(props) =>
                renderStationItem({ ...props, showDistance: false })
              }
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <EmptyListComponent message="Você ainda não favoritou nenhum posto." />
              }
              contentContainerStyle={styles.listContent}
              estimatedItemSize={5}
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Últimas Buscas"
            icon={<Heart size={20} color={themeState.colors.primary.main} />}
            onPress={() => router.push("tabs/search" as any)}
          />
          <FlashList
            data={recentlyViewedStations}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={(props) =>
              renderStationItem({
                ...props,
                showDistance: props.item.distance != null,
              })
            }
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyListComponent message="Nenhum posto visitado recentemente." />
            }
            contentContainerStyle={styles.listContent}
            estimatedItemSize={10}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
      padding: theme.spacing.xl,
    },
    cardWrapper: {
      width: 300,
      marginRight: theme.spacing.md,
    },
    emptyContainer: {
      width: 300,
      height: 167,
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
