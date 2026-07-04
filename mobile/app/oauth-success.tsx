import { useEffect } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { design } from "@/lib/design";

export default function OAuthSuccessScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { setToken } = useAuth();

  useEffect(() => {
    (async () => {
      if (token) {
        await setToken(token);
        router.replace("/recipes");
      }
    })();
  }, [token, router, setToken]);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: design.color.background }}>
      <Text style={{ color: design.color.foreground }}>Completing sign in...</Text>
    </View>
  );
}
