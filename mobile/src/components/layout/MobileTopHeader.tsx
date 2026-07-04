import { Link, usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { design } from "@/lib/design";
import { useLang } from "@/lib/language";
import { useAuth } from "@/providers/AuthProvider";

export function MobileTopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();
  const { user } = useAuth();

  const nav = [
    { path: "/recipes", label: t.recipes, icon: "restaurant-outline" as const },
    { path: "/meal-plan", label: t.mealPlan, icon: "calendar-outline" as const },
    { path: "/community", label: t.community, icon: "people-outline" as const },
    { path: "/settings", label: t.settings, icon: "options-outline" as const }
  ];

  return (
    <View
      className="border-b px-4 pb-3 pt-2"
      style={{ backgroundColor: "rgba(252,250,246,0.94)", borderColor: design.color.border }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Link href="/recipes" asChild>
          <Pressable className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: design.color.primary }}>
              <Ionicons name="restaurant" size={16} color="#fdf7f0" />
            </View>
            <Text className="text-3xl font-semibold" style={{ fontFamily: design.font.heading, color: "#2f2522" }}>
              Savora
            </Text>
          </Pressable>
        </Link>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push("/recipe/new" as any)}
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: design.color.primary }}
          >
            <Text className="text-xs font-semibold text-white">+ {t.addRecipe}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push((user ? "/settings" : "/login") as any)}
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: design.color.primary }}
          >
            <Text className="text-xs font-semibold text-white">{user?.full_name || user?.fullName || "Login"}</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {nav.map((item) => {
          const active = pathname === item.path || (item.path === "/recipes" && pathname === "/");
          return (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as any)}
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: active ? design.color.muted : "transparent" }}
            >
              <Ionicons name={item.icon} size={13} color={design.color.mutedForeground} />
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
