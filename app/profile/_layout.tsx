import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function ProfileLayout() {
  const CustomBackButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
      <Feather name="arrow-left" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <CustomBackButton />
      }}
    >
      <Stack.Screen name="edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="personal-info"
        options={{ title: "Personal Information" }}
      />
      <Stack.Screen name="preferences" options={{ title: "Preferences" }} />
      <Stack.Screen name="payment" options={{ title: "Payment Methods" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="help" options={{ title: "Help & Support" }} />
      <Stack.Screen name="favorites" options={{ title: "Postos que você segue" }} />
    </Stack>
  );
}
