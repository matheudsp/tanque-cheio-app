import { useEffect, useState, useCallback } from "react";
import {
  InterstitialAd,
  AdEventType,
  AppOpenAd,
} from "react-native-google-mobile-ads";
import { useUserStore } from "@/stores/userStore";
import { AdUnitIds } from "@/constants/ads";

interface AdCallbacks {
  onAdDismissed?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

export const useInterstitialAd = () => {
  const { isPremium } = useUserStore();

  const showInterstitialAd = useCallback(
    (callbacks?: AdCallbacks) => {
      if (isPremium) {
        console.log("Usuário premium, anúncio intersticial não será exibido.");
        // Se for premium, chama o callback de 'dispensado' imediatamente
        // para que o fluxo de navegação continue.
        callbacks?.onAdDismissed?.();
        return;
      }

      try {
        const interstitialAd = InterstitialAd.createForAdRequest(
          AdUnitIds.INTERSTITIAL!,
          {
            requestNonPersonalizedAdsOnly: true,
          }
        );

        // Listener para quando o anúncio é carregado
        const unsubscribeLoaded = interstitialAd.addAdEventListener(
          AdEventType.LOADED,
          () => {
            interstitialAd.show();
          }
        );

        // Listener para quando o usuário fecha o anúncio
        const unsubscribeClosed = interstitialAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            console.log("Anúncio intersticial fechado pelo usuário.");
            callbacks?.onAdDismissed?.();
            unsubscribeAll();
          }
        );

        // Listener para erros
        const unsubscribeError = interstitialAd.addAdEventListener(
          AdEventType.ERROR,
          (error) => {
            console.error(
              "Erro ao carregar ou exibir o anúncio intersticial:",
              error
            );
            callbacks?.onAdFailedToLoad?.(error);
            unsubscribeAll();
          }
        );

        const unsubscribeAll = () => {
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
        };

        interstitialAd.load();
      } catch (error) {
        console.error("Falha ao criar o anúncio intersticial:", error);
        if (error instanceof Error) {
          callbacks?.onAdFailedToLoad?.(error);
        }
      }
    },
    [isPremium]
  );

  return { showInterstitialAd };
};
