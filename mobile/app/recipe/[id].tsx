import { useMemo } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { savouraClient } from "@/api/savouraClient";
import { design } from "@/lib/design";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: recipe } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => savouraClient.entities.Recipe.get(id),
    enabled: !!id
  });

  const ingredients = useMemo(() => recipe?.ingredients || [], [recipe?.ingredients]);
  const instructions = useMemo(() => recipe?.steps || [], [recipe?.steps]);

  const handleDownloadPdf = async () => {
    if (!recipe) return;

    const html = `
      <html>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #2f2522;">
        <h1>${recipe.name}</h1>
        <p>${recipe.description || ""}</p>
        <h2>Ingredients</h2>
        <ul>
          ${ingredients
            .map((item: any) => `<li>${typeof item === "string" ? item : `${item.amount || ""} ${item.name || ""}`.trim()}</li>`)
            .join("")}
        </ul>
        <h2>Instructions</h2>
        <ol>
          ${instructions.map((s: any) => `<li>${typeof s === "string" ? s : s?.step || ""}</li>`).join("")}
        </ol>
      </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });

      if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = file.uri;
        a.download = `${recipe.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export recipe PDF"
        });
      } else {
        Alert.alert("PDF Ready", `Saved to: ${file.uri}`);
      }
    } catch (error: any) {
      Alert.alert("PDF Error", error?.message || "Could not export PDF.");
    }
  };

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: design.color.background }}>
        <Text style={{ color: design.color.mutedForeground }}>Loading recipe...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: design.color.background }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="flex-row items-center justify-between px-4 pt-3">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: design.color.border }}>
          <Ionicons name="arrow-back" size={16} color={design.color.foreground} />
        </Pressable>
        <Pressable onPress={handleDownloadPdf} className="rounded-full px-4 py-2" style={{ backgroundColor: design.color.primary }}>
          <Text className="text-xs font-semibold text-white">Download PDF</Text>
        </Pressable>
      </View>

      {!!recipe.image_url && (
        <Image source={{ uri: recipe.image_url }} style={{ width: "100%", height: 260 }} resizeMode="cover" />
      )}

      <View className="px-4 pt-4">
        <Text className="text-4xl font-bold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
          {recipe.name}
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {!!recipe.category && (
            <View className="rounded-full border px-3 py-1" style={{ borderColor: design.color.border }}>
              <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
                {recipe.category}
              </Text>
            </View>
          )}
          {!!recipe.prep_time && (
            <View className="rounded-full border px-3 py-1" style={{ borderColor: design.color.border }}>
              <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
                Prep: {recipe.prep_time}m
              </Text>
            </View>
          )}
          {!!recipe.cook_time && (
            <View className="rounded-full border px-3 py-1" style={{ borderColor: design.color.border }}>
              <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
                Cook: {recipe.cook_time}m
              </Text>
            </View>
          )}
        </View>

        {!!recipe.description && (
          <Text className="mt-4 text-sm leading-6" style={{ color: design.color.mutedForeground }}>
            {recipe.description}
          </Text>
        )}

        <Text className="mt-6 text-3xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
          Ingredients
        </Text>
        <View className="mt-2 gap-2">
          {ingredients.map((item: any, idx: number) => (
            <View
              key={`${idx}-${item?.name || item}`}
              className="rounded-xl border px-3 py-2"
              style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
            >
              <Text style={{ color: design.color.foreground }}>
                • {typeof item === "string" ? item : `${item.amount || ""} ${item.unit || ""} ${item.name || ""}`.trim()}
              </Text>
            </View>
          ))}
        </View>

        <Text className="mt-6 text-3xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
          Instructions
        </Text>
        <View className="mt-2 gap-2">
          {instructions.map((step: any, idx: number) => (
            <View
              key={`${idx}-${step?.step || step}`}
              className="rounded-xl border px-3 py-3"
              style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
            >
              <Text className="font-semibold" style={{ color: design.color.foreground }}>
                Step {idx + 1}
              </Text>
              <Text className="mt-1" style={{ color: design.color.mutedForeground }}>
                {typeof step === "string" ? step : step.step || ""}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
