import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const CATEGORIES = ["all", "breakfast", "lunch", "dinner", "snack", "dessert", "drink"];

export default function RecipeFilters({ search, onSearchChange, category, onCategoryChange }) {
  const { t } = useLang();

  const categoryLabel = (value) => {
    const map = {
      all: t.all,
      breakfast: t.breakfast,
      lunch: t.lunch,
      dinner: t.dinner,
      snack: t.snack,
      dessert: t.dessert,
      drink: t.drink,
    };
    return map[value] || value;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="pl-9 pr-8"
        />
        {search && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map(c => (
          <Button
            key={c}
            variant={category === c ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(c)}
            className={`text-xs ${category === c ? "bg-primary hover:bg-primary/90" : "border-border/60"}`}
          >
            {categoryLabel(c)}
          </Button>
        ))}
      </div>
    </div>
  );
}