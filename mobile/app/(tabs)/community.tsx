import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { PostComposerMobile } from "@/components/community/PostComposerMobile";
import { PostCardMobile } from "@/components/community/PostCardMobile";
import { design } from "@/lib/design";
import { useLang } from "@/lib/language";

export default function CommunityScreen() {
  const { t } = useLang();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => savouraClient.entities.CommunityPost.list()
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.color.background }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <View>
              <Text
                className="text-4xl font-bold tracking-tight"
                style={{ color: design.color.foreground, fontFamily: design.font.heading }}
              >
                {t.community}
              </Text>
              <Text className="mt-1.5 text-sm" style={{ color: design.color.mutedForeground }}>
                {t.communitySubtitle}
              </Text>
            </View>
            <PostComposerMobile />
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
                {t.noPostsYet}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: design.color.mutedForeground }}>
                {t.beFirstToShare}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <PostCardMobile post={item} />}
      />
    </SafeAreaView>
  );
}

