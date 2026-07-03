
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function ShareToCommunityButton({ recipe }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLang();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const shareMutation = useMutation({
    mutationFn: () =>
      base44.entities.CommunityPost.create({
        author_name: me?.full_name || me?.email || "Anonymous",
        content: `Check out this recipe: ${recipe.name}`,
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        recipe_image: recipe.image_url || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      window.alert(t.sharedToCommunity);
      navigate("/community");
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={shareMutation.isPending}
      onClick={() => shareMutation.mutate()}
    >
      <Share2 className="w-4 h-4" /> {t.share}
    </Button>
  );
}