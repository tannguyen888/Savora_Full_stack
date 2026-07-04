import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { savouraClient } from "@/api/savouraClient";
import { useAuth } from "@/providers/AuthProvider";
import { design } from "@/lib/design";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await savouraClient.auth.register({ email, password });
      await setToken(data.jwt);
      router.replace("/recipes");
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.color.background }}>
      <View className="flex-1 justify-center px-6">
        <Pressable onPress={() => router.back()} className="mb-4 h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: design.color.border }}>
          <Ionicons name="arrow-back" size={16} color={design.color.foreground} />
        </Pressable>
        <Text className="text-center text-5xl font-bold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
          Create your account
        </Text>
        <Text className="mt-1 text-center" style={{ color: design.color.mutedForeground }}>
          Sign up to get started
        </Text>

        <View className="mt-6 gap-3">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
            placeholderTextColor={design.color.mutedForeground}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
            placeholderTextColor={design.color.mutedForeground}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
            placeholderTextColor={design.color.mutedForeground}
          />

          {!!error && <Text style={{ color: "#ef4444" }}>{error}</Text>}

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: design.color.primary }}
          >
            <Text className="text-center text-sm font-semibold text-white">{loading ? "Creating..." : "Create account"}</Text>
          </Pressable>

          <Pressable
            onPress={() => savouraClient.auth.loginWithProvider("google", "/oauth-success")}
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: design.color.border }}
          >
            <Text className="text-center text-sm font-semibold" style={{ color: design.color.foreground }}>
              Continue with Google
            </Text>
          </Pressable>

          <Link href="/login" asChild>
            <Pressable>
              <Text className="text-center text-sm" style={{ color: design.color.primary }}>
                Log in
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
