import React from "react";
import { useUserStore } from "@/stores/userStore";

interface AdWrapperProps {
  children: React.ReactNode;
}

/**
 * Um componente wrapper que renderiza seus filhos
 * apenas se o usuário não for premium.
 */
export const AdWrapper: React.FC<AdWrapperProps> = ({ children }) => {
  const isPremium = useUserStore((state) => state.isPremium);

  if (isPremium) {
    return null;
  }

  return <>{children}</>;
};
