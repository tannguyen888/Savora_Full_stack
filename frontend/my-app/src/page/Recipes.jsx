import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeFilters from "@/components/recipes/RecipeFilters";
import PullToRefresh from "@/components/recipes/PullToRefresh";
import { useLang } from "@/lib/LanguageContext";

export default function Recipes() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const queryClient = useQueryClient();
  const { t } = useLang();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => savouraClient.entities.Recipe.list("-created_date"),
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["recipes"] });
  }, [queryClient]);

  const filtered = recipes.filter(r => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || r.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-8" style={{ overscrollBehavior: "none" }}>
        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t.myRecipes}
            </h1>
            <p className="text-muted-foreground mt-1.5">
              {t.recipeInCollection(recipes.length)}
            </p>
          </div>
          <Link to="/recipe/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-sm no-select">
              <Plus className="w-4 h-4" />
              {t.addRecipe}
            </Button>
          </Link>
        </div>

        <RecipeFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">
              {search || category !== "all" ? t.noRecipesFound : t.noRecipesYet}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {search || category !== "all"
                ? t.tryAdjusting
                : t.startBuilding}
            </p>
            {!search && category === "all" && (
              <Link to="/recipe/new">
                <Button className="gap-2 bg-primary hover:bg-primary/90 no-select">
                  <Plus className="w-4 h-4" /> {t.addYourFirstRecipe}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
