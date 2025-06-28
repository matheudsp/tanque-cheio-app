import Purchases, { PurchasesOffering, CustomerInfo } from "react-native-purchases";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";

import { useUserStore } from "@/stores/userStore";

// Chave do "Entitlement" que criamos no painel do RevenueCat
const PREMIUM_ENTITLEMENT = "premium";

interface PurchasesContextProps {
  isPremium: boolean;
  offerings: PurchasesOffering | null;
  purchasePackage: (pkg: any) => Promise<void>;
  restorePurchases: () => Promise<void>;
  isLoading: boolean;
}

const PurchasesContext = createContext<PurchasesContextProps | undefined>(undefined);

export const PurchasesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUserStore();
  const setIsPremiumInStore = useUserStore((state) => state.setIsPremium);

  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa o SDK do RevenueCat
  useEffect(() => {
    const init = async () => {
      if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_KEY_ANDROID! });
      } else {
        await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_KEY_IOS! });
      }

      setIsLoading(false);

      // Carrega as ofertas disponíveis
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings.current);

      // Obtém o status de assinatura do usuário
      const customerInfo = await Purchases.getCustomerInfo();
      updateSubscriptionStatus(customerInfo);
    };
    init();
  }, []);

  // Identifica o usuário no RevenueCat quando ele loga
  useEffect(() => {
    const identifyUser = async () => {
      if (user) {
        try {
          await Purchases.logIn(user.id);
          const customerInfo = await Purchases.getCustomerInfo();
          updateSubscriptionStatus(customerInfo);
        } catch (e) {
          console.error("RevenueCat login failed", e);
        }
      }
    };
    identifyUser();
  }, [user]);

  const updateSubscriptionStatus = (customerInfo: CustomerInfo) => {
    const userIsPremium = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== "undefined";
    setIsPremium(userIsPremium);
    setIsPremiumInStore(userIsPremium); // Atualiza o estado global no Zustand
  };

  const purchasePackage = async (pkg: any) => {
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      updateSubscriptionStatus(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        alert(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      updateSubscriptionStatus(customerInfo);
      alert("Compras restauradas com sucesso!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PurchasesContext.Provider
      value={{
        isPremium,
        offerings,
        purchasePackage,
        restorePurchases,
        isLoading,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};

// Hook customizado para consumir o contexto
export const usePurchases = (): PurchasesContextProps => {
  const context = useContext(PurchasesContext);
  if (!context) {
    throw new Error("usePurchases must be used within a PurchasesProvider");
  }
  return context;
};