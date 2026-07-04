import { memo, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Recipe } from "@/types/domain";
import { design } from "@/lib/design";

type Props = {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  isDeleting?: boolean;
};

function RecipeCardMobileBase({ recipe, onEdit, onDelete, isDeleting = false }: Props) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 30,
      bounciness: 3,
      useNativeDriver: true
    }).start();
  };

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    breakfast: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
    lunch: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
    dinner: { bg: "#e0e7ff", text: "#4338ca", border: "#c7d2fe" },
    snack: { bg: "#ffe4e6", text: "#be123c", border: "#fecdd3" },
    dessert: { bg: "#fce7f3", text: "#be185d", border: "#fbcfe8" },
    drink: { bg: "#cffafe", text: "#0e7490", border: "#a5f3fc" }
  };

  const badge = recipe.category ? categoryColors[recipe.category] : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/recipe/${recipe.id}` as any)}
      onPressIn={() => animateTo(0.985)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor: design.color.border,
          backgroundColor: design.color.card,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          transform: [{ scale }]
        }}
      >
      {recipe.image_url ? (
        <Image source={{ uri: recipe.image_url }} className="h-44 w-full" />
      ) : (
        <View className="h-44 w-full items-center justify-center" style={{ backgroundColor: design.color.muted }}>
          <Text className="text-4xl">🍽️</Text>
        </View>
      )}

      {badge ? (
        <View
          className="absolute left-3 top-3 rounded-full border px-2.5 py-1"
          style={{ backgroundColor: badge.bg, borderColor: badge.border }}
        >
          <Text className="text-xs font-semibold capitalize" style={{ color: badge.text }}>
            {recipe.category}
          </Text>
        </View>
      ) : null}

      {(!!onEdit || !!onDelete) && (
        <View className="absolute right-3 top-3 flex-row items-center gap-1.5">
          {!!onEdit && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onEdit(recipe);
              }}
              className="rounded-full border p-1.5"
              style={{ borderColor: design.color.border, backgroundColor: design.color.primarySoft }}
            >
              <Ionicons name="create-outline" size={14} color={design.color.primary} />
            </Pressable>
          )}

          {!!onDelete && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onDelete(recipe);
              }}
              disabled={isDeleting}
              className="rounded-full border p-1.5"
              style={{ borderColor: "#b91c1c", backgroundColor: design.color.card, opacity: isDeleting ? 0.7 : 1 }}
            >
              <Ionicons name={isDeleting ? "time-outline" : "trash-outline"} size={14} color="#b91c1c" />
            </Pressable>
          )}
        </View>
      )}

      <View className="p-4">
        <Text
          className="text-lg font-semibold"
          style={{ color: design.color.foreground, fontFamily: design.font.heading }}
          numberOfLines={1}
        >
          {recipe.name}
        </Text>

        {recipe.description ? (
          <Text className="mt-1.5 text-sm leading-5" style={{ color: design.color.mutedForeground }} numberOfLines={2}>
            {recipe.description}
          </Text>
        ) : null}

        <View className="mt-3 flex-row items-center gap-3">
          <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
            {totalTime > 0 ? `${totalTime} min total` : "0 min total"}
          </Text>
          <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
            {recipe.servings ?? "?"} servings
          </Text>
          <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
            {recipe.ingredients?.length ?? 0} ingredients
          </Text>
        </View>
      </View>
      </Animated.View>
    </Pressable>
  );
}

export const RecipeCardMobile = memo(RecipeCardMobileBase);
