import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";

const categoryColors = {
  breakfast: "bg-amber-100 text-amber-700 border-amber-200",
  lunch: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dinner: "bg-indigo-100 text-indigo-700 border-indigo-200",
  snack: "bg-rose-100 text-rose-700 border-rose-200",
  dessert: "bg-pink-100 text-pink-700 border-pink-200",
  drink: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export default function RecipeCard({ recipe, index = 0 }) {
  const { t } = useLang();
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const categoryLabel = {
    breakfast: t.breakfast,
    lunch: t.lunch,
    dinner: t.dinner,
    snack: t.snack,
    dessert: t.dessert,
    drink: t.drink,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link to={`/recipe/${recipe.id}`}>
        <Card className="group overflow-hidden border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
                <span className="text-5xl">🍽️</span>
              </div>
            )}
            {recipe.category && (
              <Badge
                className={`absolute top-3 left-3 text-xs font-medium border ${categoryColors[recipe.category] || "bg-secondary text-secondary-foreground"}`}
              >
                {categoryLabel[recipe.category] || recipe.category}
              </Badge>
            )}
          </div>

          <div className="p-4 space-y-2">
            <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {recipe.name}
            </h3>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>
            )}
            <div className="flex items-center gap-4 pt-1">
              {totalTime > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalTime} {t.minTotal}</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{recipe.servings} {t.servings}</span>
                </div>
              )}
              {recipe.ingredients?.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {recipe.ingredients.length} {t.ingredients}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}