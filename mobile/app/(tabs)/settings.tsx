import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { useAuth } from "@/providers/AuthProvider";
import { useLang } from "@/lib/language";
import { design } from "@/lib/design";
import { useThemeMode } from "@/lib/theme";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { lang, switchLang, LANGUAGES, t } = useLang();
  const { isDark, toggleTheme } = useThemeMode();

  useQuery({
    queryKey: ["me"],
    queryFn: () => savouraClient.auth.me(),
    enabled: !user
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.color.background }}>
      <View className="px-4 pb-24 pt-4">
        <Text className="text-5xl font-bold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
          {t.settings}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: design.color.mutedForeground }}>
          {t.settingsSubtitle}
        </Text>

        <View className="mt-5 rounded-xl border p-4" style={{ borderColor: design.color.border, backgroundColor: design.color.card }}>
          <Text className="mb-3 text-2xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            {t.languageSection}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.values(LANGUAGES).map((item) => {
              const active = item.code === lang;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => switchLang(item.code as any)}
                  className="min-w-[48%] rounded-xl border px-3 py-3"
                  style={{
                    borderColor: active ? design.color.primary : design.color.border,
                    backgroundColor: active ? design.color.primary : design.color.card
                  }}
                >
                  <Text className="text-sm font-semibold" style={{ color: active ? "#fff" : design.color.foreground }}>
                    {item.flag} {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-xl border p-4" style={{ borderColor: design.color.border, backgroundColor: design.color.card }}>
          <Text className="text-2xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            {t.themeSection}
          </Text>
          <View className="mt-3 flex-row items-center justify-between rounded-xl border px-3 py-3" style={{ borderColor: design.color.border }}>
            <View>
              <Text className="text-sm font-semibold" style={{ color: design.color.foreground }}>
                {t.darkMode}
              </Text>
              <Text className="mt-0.5 text-xs" style={{ color: design.color.mutedForeground }}>
                {isDark ? t.darkModeOn : t.darkModeOff}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleTheme()}
              className="rounded-full border px-4 py-2"
              style={{
                borderColor: isDark ? "#475569" : design.color.border,
                backgroundColor: isDark ? "#1e293b" : design.color.primarySoft
              }}
            >
              <Text className="text-xs font-semibold" style={{ color: isDark ? "#e2e8f0" : design.color.foreground }}>
                {isDark ? t.darkModeOn : t.darkModeOff}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4 rounded-xl border p-4" style={{ borderColor: design.color.border, backgroundColor: design.color.card }}>
          <Text className="text-2xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            {t.accountSection}
          </Text>
          <Text className="mt-3 text-base" style={{ color: design.color.foreground }}>
            {user?.full_name || user?.fullName || "-"}
          </Text>
          <Text className="mt-1 text-xs" style={{ color: design.color.mutedForeground }}>
            {user?.email || t.noEmail}
          </Text>

          <Pressable
            onPress={() => signOut()}
            className="mt-4 rounded-xl border px-4 py-3"
            style={{ borderColor: design.color.border }}
          >
            <Text className="text-sm font-semibold" style={{ color: design.color.mutedForeground }}>
              {t.logout}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
