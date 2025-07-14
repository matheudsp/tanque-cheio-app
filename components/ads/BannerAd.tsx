// src/components/ads/BannerAd.tsx

import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AdWrapper } from "./AdWrapper";
import { AdUnitIds } from "@/constants/ads";

export const BannerAdComponent: React.FC = () => {
  const [isAdVisible, setAdVisible] = useState(false);

  return (
    <AdWrapper>
      <View style={[styles.container, !isAdVisible && styles.hidden]}>
        <BannerAd
          unitId={AdUnitIds.BANNER!}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            console.log("Banner Ad carregado com sucesso.");
            setAdVisible(true);
          }}
          onAdFailedToLoad={(error) => {
            console.error("Falha ao carregar o banner ad:", error);
            setAdVisible(false);
          }}
        />
      </View>
    </AdWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    alignItems: "center",
  },
  hidden: {
    height: 0,
  },
});
