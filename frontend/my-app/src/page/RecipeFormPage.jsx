import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeForm from "@/components/recipes/RecipeForm";
import AIRecipeGenerator from "@/components/recipes/AIRecipeGenerator";
import IngredientScanner from "@/components/recipes/IngredientScanner";

export default function RecipeFormPage() {
  const path = window.location.pathname;
  const isEdit = path.endsWith("/edit");
  const id = isEdit ? path.split("/recipe/")[1].replace("/edit", "") : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aiData, setAiData] = useState(null);
  const { t } = useLang();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const recipes = await base44.entities.Recipe.filter({ id });
      return recipes[0];
    },
    enabled: isEdit && !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      navigate(`/recipe/${created.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      navigate(`/recipe/${id}`);
    },
  });

  const handleSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground -ml-2 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </Button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          {isEdit ? t.editRecipe : t.newRecipe}
        </h1>
        {!isEdit && <AIRecipeGenerator onGenerated={setAiData} />}
        {!isEdit && <IngredientScanner onGenerated={setAiData} />}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6 sm:p-8">
          <RecipeForm
            key={aiData ? JSON.stringify(aiData) : "manual"}
            recipe={isEdit ? recipe : aiData}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}