import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CommentSection from "@/component/community/CommentSection";
import { Button } from "@/components/ui/button";
import { savouraClient } from "@/api/savouraClient";
import { useLang } from "@/lib/LanguageContext";

function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const authorName = post.author_name || "Anonymous";
  const { t } = useLang();

  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: () => savouraClient.entities.Post.share(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => savouraClient.entities.Post.like(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  const handleLikeLimit = () => {
    if (hasLiked || likeMutation.isPending) return; // đã like rồi hoặc đang xử lý -> chặn

    setHasLiked(true);
    likeMutation.mutate(undefined, {
      onError: () => {
        // gọi API thất bại thì cho phép like lại
        setHasLiked(false);
      },
    });
  };
  const handleShare = () => {
    shareMutation.mutate();
  };

  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-primary">
            {authorName[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">{authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
          </p>
        </div>
      </div>

      {post.content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}

      {post.recipe_id && (
        <Link
          to={`/recipe/${post.recipe_id}`}
          className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors no-select"
        >
          {post.recipe_image ? (
            <img src={post.recipe_image} alt="" className="w-12 h-12 rounded-md object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-md bg-primary/10" />
          )}
          <span className="text-sm font-medium truncate">{post.recipe_name}</span>
        </Link>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleLikeLimit}
          disabled={hasLiked || likeMutation.isPending}
          className={`flex items-center gap-1.5 text-xs transition-colors no-select ${
            hasLiked ? "text-red-500 cursor-default" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-red-500" : ""}`} />
          {post.like_count ?? 0} {hasLiked ? t.liked : t.likes}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors no-select"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {showComments ? t.hideComments : t.comment}
        </button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={shareMutation.isPending}
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" /> {t.share} ({post.share_count ?? 0})
        </Button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}

export default PostCard;
