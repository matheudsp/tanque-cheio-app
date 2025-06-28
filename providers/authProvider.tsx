import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { usersAPI } from "@/services/user.service";
import { SplashScreen } from "expo-router";
import { getTokenData } from "@/services/api"; 

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
  const { isAuthenticated, setUser } = useUserStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        //Verificamos se existe um token antes de qualquer coisa
        const token = await getTokenData();

        if (!token) {
          // Se não há token, não fazemos chamada à API.
          // Consideramos o usuário deslogado e terminamos o loading.
          setUser(null);
          return; 
        }

        const currentUser = await usersAPI.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Se der erro (token inválido na API, 404, etc.), garantimos que o usuário seja nulo.
        setUser(null);
      } finally {
        // A verificação terminou, podemos esconder a splash screen e renderizar o app.
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    checkAuthStatus();
  }, [setUser]);

  
  if (isLoading) {
    return null; // A SplashScreen já está visível, então retornar null é seguro.
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
