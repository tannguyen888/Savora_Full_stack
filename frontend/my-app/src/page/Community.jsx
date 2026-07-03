import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import PostComposer from "@/component/community/PostComposer";
import PostCard from "@/component/community/PostCard";
import { useLang } from "@/lib/LanguageContext";

export default function Community() {
  const { t } = useLang();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">{t.community}</h1>
        <p className="text-muted-foreground mt-1.5">{t.communitySubtitle}</p>
      </div>

      <PostComposer />

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">{t.noPostsYet}</h3>
          <p className="text-muted-foreground max-w-sm">{t.beFirstToShare}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}