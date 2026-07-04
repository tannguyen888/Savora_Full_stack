import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "savora_token";

export async function getAuthToken() {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  }
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAuthToken(token?: string) {
  if (!token) {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
      return;
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
    return;
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAuthToken() {
  await setAuthToken(undefined);
}
