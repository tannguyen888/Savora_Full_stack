import { useState } from "react";
import { Alert, Image, Platform, Pressable, Share, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { CommunityPost } from "@/types/domain";
import { savouraClient } from "@/api/savouraClient";
import { formatTimeAgo } from "@/lib/time";
import { CommentSectionMobile } from "@/components/community/CommentSectionMobile";
import { design } from "@/lib/design";
import { useLang } from "@/lib/language";

type Props = {
  post: CommunityPost;
};

export function PostCardMobile({ post }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const { t } = useLang();
  const queryClient = useQueryClient();
  const router = useRouter();

  const likeMutation = useMutation({
    mutationFn: () => savouraClient.entities.Post.like(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
    onError: () => setHasLiked(false)
  });

  const shareMutation = useMutation({
    mutationFn: () => savouraClient.entities.Post.share(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communityPosts"] })
  });

  const saveToRecipesMutation = useMutation({
    mutationFn: async () => {
      if (post.recipe_id) {
        const source = await savouraClient.entities.Recipe.get(post.recipe_id);
        return savouraClient.entities.Recipe.create({
          name: `${source.name} (${t.fromCommunityTag})`,
          description: source.description,
          image_url: source.image_url,
          category: source.category,
          servings: source.servings,
          prep_time: source.prep_time,
          cook_time: source.cook_time,
          ingredients: source.ingredients ?? [],
          steps: source.steps ?? [],
          tags: source.tags ?? []
        });
      }

      return savouraClient.entities.Recipe.create({
        name: post.recipe_name || t.communityRecipeNameFallback,
        description: post.content,
        image_url: post.recipe_image,
        ingredients: [],
        steps: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      Alert.alert(t.savedTitle, t.savedMessage);
    },
    onError: () => {
      Alert.alert(t.saveFailedTitle, t.saveFailedMessage);
    }
  });

  const initial = (post.author_name || "A").charAt(0).toUpperCase();

  const handleShare = async () => {
    try {
      await shareMutation.mutateAsync();
      if (post.recipe_id) {
        const base = Platform.OS === "web" ? globalThis.location?.origin ?? "" : "";
        const link = `${base}/recipe/${post.recipe_id}`;
        await Share.share({
            message: `${post.recipe_name || t.communityRecipeNameFallback} ${link}`
        });
      }
    } catch {
      // ignore share popup failures and keep API action behavior
    }
  };

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: design.color.primarySoft }}>
          <Text className="text-[10px] font-semibold" style={{ color: design.color.primary }}>{initial}</Text>
        </View>
        <View>
          <Text className="text-xs font-semibold" style={{ color: design.color.foreground }}>{post.author_name}</Text>
          <Text className="text-[11px]" style={{ color: design.color.mutedForeground }}>{formatTimeAgo(post.created_date)}</Text>
        </View>
      </View>

      {post.content ? <Text className="mt-2.5 text-sm leading-5" style={{ color: design.color.foreground }}>{post.content}</Text> : null}

      {post.recipe_id ? (
        <Pressable
          onPress={() => router.push(`/recipe/${post.recipe_id}` as any)}
          className="mt-3 flex-row items-center gap-3 rounded-xl border p-2.5"
          style={{ borderColor: design.color.border, backgroundColor: design.color.primarySoft }}
        >
          {post.recipe_image ? (
            <Image source={{ uri: post.recipe_image }} className="h-12 w-12 rounded-md" />
          ) : (
            <View className="h-12 w-12 rounded-md" style={{ backgroundColor: design.color.primarySoft }} />
          )}
          <Text className="flex-1 text-sm font-medium" style={{ color: design.color.foreground }} numberOfLines={1}>
            {post.recipe_name}
          </Text>
        </Pressable>
      ) : null}

      <View className="mt-3 flex-row items-center gap-2">
        <Pressable
          onPress={() => {
            if (!hasLiked && !likeMutation.isPending) {
              setHasLiked(true);
              likeMutation.mutate();
            }
          }}
          className="rounded-full px-2.5 py-1.5"
        >
          <Text className="text-xs" style={{ color: hasLiked ? "#ef4444" : design.color.mutedForeground }}>
            {t.likeLabel(post.like_count ?? 0)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowComments((v) => !v)}
          className="rounded-full px-2.5 py-1.5"
        >
          <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
            💬 {t.comment}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          className="rounded-full border px-2.5 py-1.5"
          style={{ borderColor: design.color.border }}
        >
          <Text className="text-xs" style={{ color: design.color.mutedForeground }}>
            🔗 {t.shareLabel(post.share_count ?? 0)}
          </Text>
        </Pressable>

        {!!post.recipe_id && (
          <Pressable
            onPress={() => saveToRecipesMutation.mutate()}
            disabled={saveToRecipesMutation.isPending}
            className="rounded-full border p-1.5"
            style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
          >
            <Ionicons
              name={saveToRecipesMutation.isPending ? "time-outline" : "bookmark-outline"}
              size={14}
              color={design.color.mutedForeground}
            />
          </Pressable>
        )}
      </View>

      {showComments ? <CommentSectionMobile postId={post.id} /> : null}
    </View>
  );
}

