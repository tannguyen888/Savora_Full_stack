import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { formatTimeAgo } from "@/lib/time";
import { design } from "@/lib/design";
import { CommunityComment } from "@/types/domain";
import { useAuth } from "@/providers/AuthProvider";
import { useLang } from "@/lib/language";

type Props = {
  postId: string;
};

export function CommentSectionMobile({ postId }: Props) {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { t } = useLang();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => savouraClient.entities.Comment.list(postId)
  });

  const createComment = useMutation({
    mutationFn: () =>
      savouraClient.entities.Comment.create({
        post_id: postId,
        author_name: user?.full_name || user?.fullName || user?.email || "Anonymous",
        content: content.trim()
      }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    }
  });

  return (
    <View
      className="mt-3 rounded-lg border p-3"
      style={{ borderColor: design.color.border, backgroundColor: design.color.muted }}
    >
      <View className="mb-3 gap-2">
        {isLoading ? <Text className="text-xs" style={{ color: design.color.mutedForeground }}>{t.loadingComments}</Text> : null}
        {comments.map((item: CommunityComment) => (
          <View key={item.id} className="rounded-md p-2" style={{ backgroundColor: design.color.card }}>
            <Text className="text-xs font-semibold" style={{ color: design.color.foreground }}>{item.author_name}</Text>
            <Text className="mt-1 text-sm" style={{ color: design.color.foreground }}>{item.content}</Text>
            <Text className="mt-1 text-[11px]" style={{ color: design.color.mutedForeground }}>{formatTimeAgo(item.created_date)}</Text>
          </View>
        ))}
      </View>

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t.writeComment}
        multiline
        className="min-h-10 rounded-md border px-3 py-2 text-sm"
        style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
        placeholderTextColor={design.color.mutedForeground}
      />

      <Pressable
        onPress={() => createComment.mutate()}
        disabled={!content.trim() || createComment.isPending}
        className="mt-2 items-center rounded-md px-3 py-2"
        style={{ backgroundColor: !content.trim() || createComment.isPending ? "#cbd5e1" : design.color.primary }}
      >
        <Text className="text-sm font-semibold text-white">
          {createComment.isPending ? `${t.posting}...` : t.postComment}
        </Text>
      </Pressable>
    </View>
  );
}

