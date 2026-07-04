import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { QueryProvider } from "@/providers/QueryProvider";
import { useAuth } from "@/providers/AuthProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider, useThemeMode } from "@/lib/theme";

function RootNavigator() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const first = segments[0];
  const isPublic = first === "login" || first === "register" || first === "oauth-success";

  if (!isLoading && !token && !isPublic) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "default" : "fade_from_bottom",
        animationDuration: 180,
        fullScreenGestureEnabled: true,
        freezeOnBlur: true
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="oauth-success" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="recipe/new" />
    </Stack>
  );
}

function AppShell() {
  const { isDark } = useThemeMode();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </QueryProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
