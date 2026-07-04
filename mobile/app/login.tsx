import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { savouraClient } from "@/api/savouraClient";
import { useAuth } from "@/providers/AuthProvider";
import { design } from "@/lib/design";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && token) {
      router.replace("/recipes");
    }
  }, [isLoading, token, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await savouraClient.auth.loginViaEmailPassword(email, password);
      await setToken(data.jwt);
      router.replace("/recipes");
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.color.background }}>
      <View className="flex-1 justify-center px-6">
        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: design.color.primary }}>
            <Ionicons name="log-in-outline" size={24} color="#fff" />
          </View>
        </View>

        <View className="mt-5 items-center">
          <Text className="text-5xl font-bold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            Welcome back
          </Text>
          <Text className="mt-1 text-lg" style={{ color: design.color.mutedForeground }}>
            Log in to your account
          </Text>
        </View>

        <View
          className="mt-8 rounded-2xl border p-4"
          style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
        >
          <Pressable
            onPress={() => savouraClient.auth.loginWithProvider("google", "/oauth-success")}
            className="rounded-full border px-4 py-3"
            style={{ borderColor: design.color.border }}
          >
            <Text className="text-center text-base font-semibold" style={{ color: design.color.foreground }}>
              G Continue with Google
            </Text>
          </Pressable>

          <View className="my-4 flex-row items-center gap-3">
            <View className="h-px flex-1" style={{ backgroundColor: design.color.border }} />
            <Text style={{ color: design.color.mutedForeground }}>OR</Text>
            <View className="h-px flex-1" style={{ backgroundColor: design.color.border }} />
          </View>

          <Text className="text-sm font-semibold" style={{ color: design.color.foreground }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            className="mt-2 rounded-full border px-4 py-3"
            style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
            placeholderTextColor={design.color.mutedForeground}
          />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-sm font-semibold" style={{ color: design.color.foreground }}>Password</Text>
            <Pressable onPress={() => Alert.alert("Forgot password", "Tính năng này sẽ được thêm ở bước tiếp theo.")}>
              <Text className="text-sm" style={{ color: design.color.primary }}>Forgot password?</Text>
            </Pressable>
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            className="mt-2 rounded-full border px-4 py-3"
            style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
            placeholderTextColor={design.color.mutedForeground}
          />

          {!!error && <Text className="mt-3" style={{ color: "#ef4444" }}>{error}</Text>}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="mt-4 rounded-full px-4 py-3"
            style={{ backgroundColor: design.color.primary }}
          >
            <Text className="text-center text-2xl font-semibold text-white">{loading ? "Logging in..." : "Log in"}</Text>
          </Pressable>
        </View>

        <View className="mt-7 flex-row items-center justify-center gap-1">
          <Text className="text-base" style={{ color: design.color.mutedForeground }}>Don't have an account?</Text>
          <Link href="/register" asChild>
            <Pressable>
              <Text className="text-base font-semibold" style={{ color: design.color.primary }}>
                Create one
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
