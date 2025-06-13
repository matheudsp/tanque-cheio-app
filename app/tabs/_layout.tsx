import React from "react";
import { Tabs } from "expo-router";
import {
  BarChart,
  Calendar,
  ClipboardList,
  Fuel,
  Home,
  User,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Platform, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: "absolute",
          left: 8,
          right: 8,
          marginHorizontal: 8,
          bottom: 16,
          backgroundColor: "#fff",
          borderRadius: 32,
          height: 72,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
          paddingTop: 8,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gas-stations"
        options={{
          title: "Procurar",
          tabBarIcon: ({ color }) => <Fuel size={24} color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="progress"
        options={{
          title: "My Progress",
          tabBarIcon: ({ color }) => <BarChart size={24} color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
