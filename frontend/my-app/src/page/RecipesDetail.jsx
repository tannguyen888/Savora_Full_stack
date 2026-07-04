import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Clock, Users, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import RecipePDFExport from "@/components/recipes/RecipePDFExport";
import GroceryList from "@/components/recipes/GorceryList";
import ShareToCommunityButton from "@/components/recipes/shareToCommunity";
export default function RecipeDetail() {
  const id = window.location.pathname.split("/recipe/")[1];
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLang();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => savouraClient.entities.Recipe.get(id),
    enabled: !!id && id !== "new",
  });

  const deleteMutation = useMutation({
    mutationFn: () => savouraClient.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t.recipeNotFound}</p>
        <Link to="/"><Button variant="outline" className="mt-4">{t.back}</Button></Link>
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Button>
        <div className="flex gap-2 flex-wrap justify-end">
            <GroceryList recipe={recipe} />
              <ShareToCommunityButton recipe={recipe} />
          <RecipePDFExport recipe={recipe} t={t} />
          <Link to={`/recipe/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="w-4 h-4" /> {t.edit}
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" /> {t.delete}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.deleteRecipe}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.deleteConfirm(recipe.name)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive hover:bg-destructive/90">
                  {t.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {recipe.image_url && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden">
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {recipe.category && (
            <Badge variant="secondary" className="capitalize">{recipe.category}</Badge>
          )}
          {recipe.tags?.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">{recipe.description}</p>
        )}
        <div className="flex gap-6 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{totalTime} {t.minTotal}</span>
              {recipe.prep_time > 0 && recipe.cook_time > 0 && (
                <span className="text-xs">({recipe.prep_time} {t.prep} + {recipe.cook_time} {t.cook})</span>
              )}
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} {t.servings}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {recipe.ingredients?.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-semibold mb-4">{t.ingredients}</h2>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="font-medium text-sm">{ing.amount}</span>
                    <span className="text-sm">{ing.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {recipe.steps?.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-semibold mb-4">{t.instructions}</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed pt-1.5 flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
