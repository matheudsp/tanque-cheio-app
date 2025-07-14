// src/constants/ads.ts (Versão corrigida)

import { Platform } from "react-native";

// IDs de Teste universais fornecidos pelo Google.
const TestAdUnitIds = {
  BANNER: "ca-app-pub-3940256099942544/6300978111",
  INTERSTITIAL: "ca-app-pub-3940256099942544/1033173712",
  REWARDED: "ca-app-pub-3940256099942544/5224354917",
};

const ProductionAdUnitIds = {
  BANNER: Platform.select({
    ios: "SEU_ID_DE_BANNER_IOS_REAL",
    android: "ca-app-pub-7557948505846700/9872663114",
  }),
  INTERSTITIAL: Platform.select({
    ios: "SEU_ID_DE_INTERSTITIAL_IOS_REAL",
    android: "ca-app-pub-7557948505846700/2418227812",
  }),
  REWARDED: Platform.select({
    ios: "SEU_ID_DE_RECOMPENSADO_IOS_REAL",
    android: "ca-app-pub-7557948505846700/4552037763",
  }),
};

export const AdUnitIds = __DEV__ ? TestAdUnitIds : ProductionAdUnitIds;
