import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { RecipeCardMobile } from "@/components/recipes/RecipeCardMobile";
import { RecipeFiltersMobile } from "@/components/recipes/RecipeFiltersMobile";
import { design } from "@/lib/design";
import { Recipe } from "@/types/domain";

export default function RecipesScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => savouraClient.entities.Recipe.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savouraClient.entities.Recipe.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });
      const previous = queryClient.getQueryData<Recipe[]>(["recipes"]);
      queryClient.setQueryData<Recipe[]>(["recipes"], (current: Recipe[] | undefined) =>
        (current ?? []).filter((recipe) => recipe.id !== id)
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["recipes"], context.previous);
      }
      Alert.alert("Delete failed", "Could not delete this recipe. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    }
  });

  const goToEditRecipe = useCallback(
    (recipe: Recipe) => {
      router.push({ pathname: "/recipe/new", params: { id: recipe.id } } as any);
    },
    [router]
  );

  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeCardMobile
        recipe={item}
        onEdit={goToEditRecipe}
        onDelete={confirmDelete}
        isDeleting={deleteMutation.isPending && deleteMutation.variables === item.id}
      />
    ),
    [goToEditRecipe, deleteMutation.isPending, deleteMutation.variables]
  );

  const confirmDelete = (recipe: Recipe) => {
    const runDelete = () => deleteMutation.mutate(recipe.id);

    if (Platform.OS === "web") {
      const ok = globalThis.confirm?.(`Delete recipe \"${recipe.name}\"?`) ?? false;
      if (ok) runDelete();
      return;
    }

    Alert.alert("Delete Recipe", `Delete recipe \"${recipe.name}\"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: runDelete }
    ]);
  };

  const filtered = useMemo(() => {
    return recipes.filter((recipe: Recipe) => {
      const text = search.trim().toLowerCase();
      const matchesSearch =
        !text ||
        recipe.name?.toLowerCase().includes(text) ||
        recipe.description?.toLowerCase().includes(text);
      const matchesCategory = category === "all" || recipe.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, search, category]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.color.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <View>
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-4xl font-bold tracking-tight"
                  style={{ color: design.color.foreground, fontFamily: design.font.heading }}
                >
                  My Recipes
                </Text>
                <Pressable
                  onPress={() => router.push("/recipe/new" as any)}
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: design.color.primary }}
                >
                  <Text className="text-xs font-semibold text-white">+ Add Recipe</Text>
                </Pressable>
              </View>
              <Text className="mt-1.5 text-sm" style={{ color: design.color.mutedForeground }}>
                {recipes.length} recipes in your collection
              </Text>
            </View>
            <RecipeFiltersMobile
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-10">
              <ActivityIndicator color={design.color.primary} />
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="text-base font-semibold" style={{ color: design.color.foreground }}>
                No recipes found
              </Text>
              <Text className="mt-1 text-sm" style={{ color: design.color.mutedForeground }}>
                Try adjusting your search or category
              </Text>
            </View>
          )
        }
        renderItem={renderRecipe}
      />
    </SafeAreaView>
  );
}

