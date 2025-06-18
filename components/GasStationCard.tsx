import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Clock, Fuel } from "lucide-react-native";
import { GasStation, GasProduct } from "@/types";
import { colors } from "@/constants/colors";
import { differenceInDays, parseISO } from "date-fns";
import { AppIcon } from "@/components/ui/AppIcon";
import { getIconNameFromFuel } from "@/utils/getIconNameFromFuel";

type GasStationCardProps = {
  station: GasStation;
  showDistance?: boolean;
  filteredFuel?: string;
  isSelected?: boolean;
};

const getUpdateStatus = (dateString?: string) => {
  if (!dateString) return { text: "Sem data", color: colors.textSecondary };
  const daysDiff = differenceInDays(new Date(), parseISO(dateString));
  if (daysDiff <= 15)
    return { text: `Atualizado há ${daysDiff} dias`, color: colors.success };
  return { text: `Atualizado há ${daysDiff} dias`, color: colors.warning };
};

const formatDistance = (distanceInKm: number) => {
  if (distanceInKm < 1) return `${Math.round(distanceInKm * 1000)} m`;
  return `${distanceInKm} km`.replace(".", ",");
};

export const GasStationCard = ({
  station,
  showDistance = true,
  filteredFuel,
  isSelected,
}: GasStationCardProps) => {
  const router = useRouter();
  
  // A lógica interna para decidir qual combustível destacar permanece a mesma.
  const cardData = useMemo(() => {
    const prices = station.fuelPrices || [];
    let heroFuel: GasProduct | null = null;
    let heroLabel = "";
    let otherPricesCount = 0;

    if (filteredFuel) {
      heroFuel =
        prices.find(
          (p) => p.productName.toUpperCase() === filteredFuel.toUpperCase()
        ) || null;
      heroLabel = heroFuel?.productName || filteredFuel;
      otherPricesCount = prices.length - (heroFuel ? 1 : 0);
    } else if (prices.length === 1) {
      heroFuel = prices[0];
      heroLabel = heroFuel.productName;
      otherPricesCount = 0;
    } else if (prices.length > 1) {
      heroFuel =
        prices.find((p) => p.productName.toUpperCase().includes("COMUM")) || null;
      if (heroFuel) {
        heroLabel = heroFuel.productName;
      } else {
        heroFuel = prices[0];
        heroLabel = heroFuel.productName;
      }
      otherPricesCount = prices.length - 1;
    }

    const priceText =
      heroFuel?.price && parseFloat(heroFuel.price) > 0
        ? `R$ ${Number(heroFuel.price).toFixed(2).replace(".", ",")}`
        : "N/A";

    const updateStatus = getUpdateStatus(heroFuel?.lastUpdated);
    const distanceText = showDistance ? formatDistance(station.distance) : "";

    const iconName = getIconNameFromFuel(heroFuel?.productName);
    return {
      heroLabel,
      priceText,
      updateStatus,
      otherPricesCount,
      distanceText,
      iconName,
    };
  }, [station, filteredFuel, showDistance]);

  const handlePress = () => {
    router.push({
      pathname: "/gas-station/[id]",
      params: { id: station.id },
    } as any);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && {
          borderWidth: 1.5,
          borderColor: colors.primaryLight,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
      <View style={styles.infoSection}>
        <View style={styles.header}>
          {/* 2. Ícone FIXO de posto de gasolina */}
          <AppIcon
            name={"gasPump"}
            width={30}
            height={30}
            style={{ marginTop: 2 }}
          />
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
          {/* 3. Container para o ícone dinâmico e o nome do combustível */}
          <View style={styles.heroLabelContainer}>
            <AppIcon name={cardData.iconName} width={30} height={30} />
            <Text style={styles.heroLabel}>{cardData.heroLabel}</Text>
          </View>
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

// 4. Estilos ajustados para a nova estrutura
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
    backgroundColor: colors.primary + "10",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  priceDetails: {
    flex: 1,
  },
  heroLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    textTransform: "uppercase",
    marginLeft: 6,
  },
  updateStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 2,
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
