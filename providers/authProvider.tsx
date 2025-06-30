import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { SplashScreen } from "expo-router";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, checkAuthOnInit } = useUserStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        
        await checkAuthOnInit();
      } catch (error) {
        console.error("Failed to initialize auth status:", error);
      } finally {
        // Ao final do processo, esconde a splash screen e libera a renderização do app.
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [checkAuthOnInit]);


  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
};