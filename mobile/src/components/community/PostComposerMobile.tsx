import { useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { design } from "@/lib/design";
import { Recipe } from "@/types/domain";
import { useAuth } from "@/providers/AuthProvider";
import { useLang } from "@/lib/language";

export function PostComposerMobile() {
  const [content, setContent] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { user } = useAuth();
  const { t } = useLang();
  const queryClient = useQueryClient();

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => savouraClient.entities.Recipe.list()
  });

  const createPost = useMutation({
    mutationFn: () =>
      savouraClient.entities.CommunityPost.create({
        author_name: user?.full_name || user?.fullName || user?.email || "Anonymous",
        content: content.trim(),
        recipe_id: selectedRecipe?.id,
        recipe_name: selectedRecipe?.name,
        recipe_image: selectedRecipe?.image_url
      }),
    onSuccess: () => {
      setContent("");
      setSelectedRecipe(null);
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    }
  });

  return (
    <>
    <View
      className="rounded-2xl border p-3.5"
      style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
    >
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t.sharePlaceholder}
        multiline
        className="min-h-20 rounded-xl border px-3 py-2.5 text-sm"
        style={{
          borderColor: design.color.border,
          backgroundColor: design.color.card,
          color: design.color.foreground
        }}
        placeholderTextColor={design.color.mutedForeground}
      />

      <View className="mt-2.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="rounded-full border px-3 py-1.5"
            style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
          >
            <Text className="text-xs font-semibold" style={{ color: design.color.foreground }}>⚔ {t.attachRecipe}</Text>
          </Pressable>
          {!!selectedRecipe && (
            <Pressable
              onPress={() => setSelectedRecipe(null)}
              className="max-w-[180px] rounded-full border px-3 py-1.5"
              style={{ borderColor: design.color.border, backgroundColor: design.color.muted }}
            >
              <Text className="text-xs" numberOfLines={1} style={{ color: design.color.foreground }}>
                {selectedRecipe.name} ✕
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => createPost.mutate()}
          disabled={(!content.trim() && !selectedRecipe) || createPost.isPending}
          className="rounded-full px-4 py-1.5"
          style={{ backgroundColor: (!content.trim() && !selectedRecipe) || createPost.isPending ? "#c8beb6" : design.color.primary }}
        >
          <Text className="text-xs font-semibold text-white">{createPost.isPending ? t.posting : t.post}</Text>
        </Pressable>
      </View>
    </View>

    <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
      <View className="flex-1 items-center justify-center bg-black/35 px-5">
        <View
          className="max-h-[70%] w-full rounded-2xl p-4"
          style={{ backgroundColor: design.color.card }}
        >
          <Text className="mb-3 text-lg font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            {t.chooseRecipeToAttach}
          </Text>
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedRecipe(item);
                  setPickerOpen(false);
                }}
                className="rounded-xl border px-3 py-3"
                style={{ borderColor: design.color.border }}
              >
                <Text className="text-sm font-semibold" style={{ color: design.color.foreground }}>
                  {item.name}
                </Text>
                {!!item.description && (
                  <Text className="mt-1 text-xs" style={{ color: design.color.mutedForeground }} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </Pressable>
            )}
          />
          <View className="mt-3 items-end">
            <Pressable onPress={() => setPickerOpen(false)} className="rounded-full border px-4 py-2" style={{ borderColor: design.color.border }}>
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>{t.close}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

