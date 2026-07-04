import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { design } from "@/lib/design";
import { useLang } from "@/lib/language";
import { useAuth } from "@/providers/AuthProvider";

export default function TabsLayout() {
  const { t } = useLang();
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: design.color.background }}>
        <ActivityIndicator color={design.color.primary} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: design.color.primary,
        tabBarInactiveTintColor: design.color.mutedForeground,
        tabBarStyle: {
          backgroundColor: "rgba(252, 250, 246, 0.96)",
          borderTopColor: design.color.border,
          borderTopWidth: 1,
          height: 64
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 6
        }
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="recipes"
        options={{
          title: t.recipes,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: t.mealPlan,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t.community,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options-outline" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
