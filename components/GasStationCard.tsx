import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Fuel, Clock } from "lucide-react-native";
import { GasStation, GasProduct } from "@/types";
import { colors } from "@/constants/colors";
import { differenceInDays, parseISO } from "date-fns";

type GasStationCardProps = {
  station: GasStation;
  showDistance?: boolean;
  filteredFuel?: string;
};

const getUpdateStatus = (dateString?: string) => {
  if (!dateString) return { text: "Sem data", color: colors.textSecondary };

  const daysDiff = differenceInDays(new Date(), parseISO(dateString));

  if (daysDiff <= 15)
    return { text: `Atualizado há ${daysDiff} dias`, color: colors.success };

  return { text: `Atualizado há ${daysDiff} dias`, color: colors.warning };
};

/**
 * Formata a distância para ser mais legível.
 */
const formatDistance = (distanceInKm: number) => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm} km`.replace(".", ",");
};

export const GasStationCard = ({
  station,
  showDistance = true,
  filteredFuel,
}: GasStationCardProps) => {
  const router = useRouter();

  /**
   * O cérebro do componente: processa os dados do posto uma única vez
   * e retorna tudo que a UI precisa para renderizar.
   */
  const cardData = useMemo(() => {
    const prices = station.fuelPrices || [];
    let heroFuel: GasProduct | null = null;
    let heroLabel = "";
    let otherPricesCount = 0;

    if (filteredFuel) {
      // Cenário 1: Usuário filtrou um combustível. Ele é o herói.
      heroFuel =
        prices.find(
          (p) => p.name.toUpperCase() === filteredFuel.toUpperCase()
        ) || null;
      heroLabel = heroFuel?.name || filteredFuel;
      otherPricesCount = prices.length - (heroFuel ? 1 : 0);
    } else if (prices.length > 0) {
      // Cenário 2: Sem filtro, vamos encontrar o melhor candidato a herói.
      // Prioridade 1: Gasolina Comum.
      heroFuel =
        prices.find((p) => p.name.toUpperCase().includes("COMUM")) || null;
      heroLabel = "Gasolina Comum";

      if (!heroFuel) {
        // Prioridade 2: O combustível mais barato como "A partir de".
        heroFuel = [...prices].sort((a, b) => a.price - b.price)[0];
        heroLabel = "A partir de";
      }
      otherPricesCount = prices.length - 1;
    }

    const priceText =
      heroFuel?.price && heroFuel.price > 0
        ? `R$ ${Number(heroFuel.price).toFixed(2).replace(".", ",")}`
        : "N/A";

    const updateStatus = getUpdateStatus(heroFuel?.lastupdated);
    const distanceText = showDistance ? formatDistance(station.distance) : "";

    return {
      heroLabel,
      priceText,
      updateStatus,
      otherPricesCount,
      distanceText,
    };
  }, [station, filteredFuel, showDistance]);

  const handlePress = () => {
    router.push({
      pathname: "/gas-station/[id]",
      params: { id: station.id },
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
      <View style={styles.infoSection}>
        <View style={styles.header}>
          <Fuel size={18} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={styles.titleInfo}>
            <Text style={styles.stationName} numberOfLines={1}>
              {station.trade_name || station.legal_name}
            </Text>
            <Text style={styles.stationBrand}>{station.brand}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {station.localization.city} • {cardData.distanceText}
          </Text>
        </View>
      </View>

      {/* SEÇÃO 2: PREÇO EM DESTAQUE */}
      <View style={styles.priceSection}>
        <View style={styles.priceDetails}>
          <Text style={styles.heroLabel}>{cardData.heroLabel}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  infoSection: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  stationBrand: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.primary + "10", // Um fundo sutil para destacar
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  priceDetails: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    textTransform: "capitalize",
  },
  updateStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  updateStatusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  priceValueContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  priceNA: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  otherPrices: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
