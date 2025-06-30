import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated"; 

import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { Button } from "@/components/Button";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

const ONBOARDING_DATA = [
  {
    id: "1",
    animation: require("@/assets/animations/search1.json"),
    title: "Encontre Postos Perto de Você",
    subtitle:
      "Com base na sua localização, mostramos os postos de combustível mais próximos com preços atualizados.",
  },
  {
    id: "2",
    animation: require("@/assets/animations/price-pizza-chart.json"),
    title: "Compare Preços e Economize",
    subtitle:
      "Visualize o histórico de preços e compare os valores para fazer a melhor escolha para o seu bolso.",
  },
  {
    id: "3",
    animation: require("@/assets/animations/paper-plane.json"),
    title: "Receba Alertas de Preço",
    subtitle:
      "Favorite seus postos e combustíveis para ser notificado sobre as melhores oportunidades de economia.",
  },
];

const Dot = ({
  activeIndex,
  index,
}: {
  activeIndex: Animated.SharedValue<number>;
  index: number;
}) => {
  const styles = useStylesWithTheme(getStyles);

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    return {
      width: withTiming(isActive ? 24 : 8, { duration: 300 }),
      opacity: withTiming(isActive ? 1 : 0.5, { duration: 300 }),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const Paginator = ({
  data,
  currentIndex,
}: {
  data: any[];
  currentIndex: number;
}) => {
  const styles = useStylesWithTheme(getStyles);
  const activeIndex = useSharedValue(currentIndex);

  useEffect(() => {
    activeIndex.value = currentIndex;
  }, [currentIndex, activeIndex]);

  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => (
        <Dot key={i.toString()} index={i} activeIndex={activeIndex} />
      ))}
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const styles = useStylesWithTheme(getStyles);
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (
      viewableItems &&
      viewableItems.length > 0 &&
      viewableItems[0].isViewable
    ) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem("@hasViewedOnboarding", "true");
      router.replace("/auth");
    } catch (e) {
      console.error("Failed to save onboarding status.", e);
      router.replace("/auth");
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleDone();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={slidesRef}
        data={ONBOARDING_DATA}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        bounces={false}
      />
      <View style={[styles.footer, { width }]}>
        <Paginator data={ONBOARDING_DATA} currentIndex={currentIndex} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleDone} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
          <Button
            title={
              currentIndex === ONBOARDING_DATA.length - 1
                ? "Começar"
                : "Avançar"
            }
            onPress={handleNext}
            variant="primary"
            size="medium"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing["2xl"],
      backgroundColor: theme.colors.background.default,
    },
    paginatorContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: theme.spacing.xl,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary.main,
      marginHorizontal: 4,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    skipButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    skipText: {
      color: theme.colors.text.secondary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
