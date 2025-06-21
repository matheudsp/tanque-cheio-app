import { colors } from "@/constants/colors";
import { Star } from "lucide-react-native";
import { View, Text, StyleSheet } from "react-native";

export const PremiumBadge = () => {
  return (
    <View style={styles.premiumBadge}>
      <Star size={12} color={colors.white} style={styles.premiumBadgeIcon} />
      <Text style={styles.premiumBadgeText}>PREMIUM</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  premiumBadgeIcon: {
    marginRight: 4,
  },
  premiumBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
});
