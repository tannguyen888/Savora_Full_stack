import {useState} from "react";
import{useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {savouraClient} from "@/api/savouraClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UtensilsCrossed, X, Send } from "lucide-react";
import RecipePicker from "@/components/mealplan/RecipePicker";
import { useLang } from "@/lib/LanguageContext";

function PostComposer() {
    const[content, setContent] = useState("");
    const[selectedRecipe, setSelectedRecipe] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { t } = useLang();
  const token = typeof window !== "undefined" ? localStorage.getItem("savora_token") : null;
    const queryClient = useQueryClient();
    const {data: me} = useQuery({
    queryKey: ["me", token],
    queryFn: () => savouraClient.auth.me(),
    enabled: Boolean(token),
    retry: false,
    });
    const{data: recipes = []} = useQuery({
        queryKey: ["recipes"],
        queryFn: () => savouraClient.entities.Recipe.list("-created_date"),
    });
    const createMutation = useMutation({
        mutationFn: (newPost) => savouraClient.entities.Post.create(newPost),
        onSuccess: () => {  
        queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
         setContent(""); 
         setSelectedRecipe(null); }
    });

    const handleSubmit = () => {
      if (!content.trim() && !selectedRecipe) {
        return;
      }

      createMutation.mutate({
        author_name: me?.fullName || me?.full_name || me?.name || me?.email || "Anonymous",
        content: content.trim(),
        recipe_id: selectedRecipe?.id || "",
        recipe_name: selectedRecipe?.name || "",
        recipe_image: selectedRecipe?.image_url || "",
      });
    };

    return (  <div className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t.shareSomethingPlaceholder}
        className="min-h-20 resize-none"
      />

      {selectedRecipe && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/40">
          {selectedRecipe.image_url ? (
            <img src={selectedRecipe.image_url} alt="" className="w-9 h-9 rounded-md object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
            </div>
          )}
          <span className="text-sm font-medium flex-1 truncate">{selectedRecipe.name}</span>
          <button onClick={() => setSelectedRecipe(null)} className="text-muted-foreground hover:text-foreground no-select">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 no-select"
          onClick={() => setPickerOpen(true)}
        >
          <UtensilsCrossed className="w-4 h-4" /> {t.attachRecipe}
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 no-select"
          disabled={(!content.trim() && !selectedRecipe) || createMutation.isPending}
          onClick={handleSubmit}
        >
          <Send className="w-4 h-4" /> {t.post}
        </Button>
      </div>

      <RecipePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        recipes={recipes}
        onSelect={setSelectedRecipe}
      />
    </div>
  );
} 


export default PostComposer;
