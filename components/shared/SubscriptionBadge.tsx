import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors"; // Certifique-se que o caminho está correto

// --- Tipos e Configuração do Badge ---

interface BadgeConfig {
  label: string;
  icon: ImageSourcePropType;
  gradientColors: string[];
  textColor?: string;
  showShineEffect: boolean;
}

// Lógica interna que mapeia o nome do plano à sua aparência
const badgeConfigMap: Record<string, BadgeConfig> = {
  premium: {
    label: "PREMIUM",
    icon: require("@/assets/images/premium.png"),
    gradientColors: [colors.secondary, colors.warning], // Gradiente dourado/amarelo
    textColor: colors.white,
    showShineEffect: true,
  },
  free: {
    label: "FREE",
    icon: require("@/assets/images/free.png"),
    gradientColors: ["#DA8A67", "#B87333"],
    textColor: colors.white,
    showShineEffect: false,
  },
  // Adicione outros planos aqui no futuro
  // pro: { ... }
};

// --- Efeito de Brilho (Componente Interno) ---
const ShineEffect = () => {
  const shinePosition = useSharedValue(-150);

  useEffect(() => {
    shinePosition.value = withRepeat(
      withSequence(
        withDelay(
          1500,
          withTiming(150, { duration: 700, easing: Easing.ease })
        ),
        withDelay(2000, withTiming(-150, { duration: 0 }))
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shinePosition.value }, { rotate: "-45deg" }],
  }));

  return (
    <Animated.View style={[styles.shine, animatedStyle]}>
      <LinearGradient
        colors={["transparent", "rgba(255, 255, 255, 0.4)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.shineGradient}
      />
    </Animated.View>
  );
};

// --- Props do Componente ---
interface SubscriptionBadgeProps {
  /** O nome do plano de assinatura (ex: "premium", "free"). */
  planName?: string;
  /** Estilos customizados para o container. */
  style?: object;
}

// --- Componente Principal ---
export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  planName,
  style,
}) => {
  if (!planName) return null;

  const normalizedPlan = planName.toLowerCase();
  const config = badgeConfigMap[normalizedPlan];

  // Se o plano não for encontrado no mapa de configuração, não renderiza nada
  if (!config) return null;

  return (
    <View style={[styles.badgeContainer, style]}>
      <LinearGradient colors={config.gradientColors} style={styles.gradient}>
        {config.showShineEffect && <ShineEffect />}
        <Image source={config.icon} style={styles.badgeIcon} />
        <Text style={[styles.badgeText, { color: config.textColor }]}>
          {config.label}
        </Text>
      </LinearGradient>
    </View>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  badgeContainer: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    alignSelf: "flex-start",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeIcon: {
    width: 18,
    height: 18,
    marginRight: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  shine: {
    position: "absolute",
    height: "200%",
    width: 30,
    top: "-50%",
    zIndex: 1,
  },
  shineGradient: {
    flex: 1,
  },
});
