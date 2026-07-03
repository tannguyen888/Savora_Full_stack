import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function MealSlot({ mealPlan, onAdd, onRemove }) {
  if (mealPlan) {
    return (
      <div className="group relative bg-card rounded-lg border border-border/50 p-2 flex items-center gap-2 hover:shadow-sm transition-all">
        {mealPlan.recipe_image ? (
          <img src={mealPlan.recipe_image} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-md bg-primary/5 flex items-center justify-center shrink-0">
            <span className="text-lg">🍽️</span>
          </div>
        )}
        <span className="text-sm font-medium truncate flex-1">{mealPlan.recipe_name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(mealPlan); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
        >
          <X className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onAdd}
      className="w-full border-2 border-dashed border-border/50 rounded-lg p-3 flex items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all text-sm"
    >
      <Plus className="w-3.5 h-3.5" />
      Add
    </button>
  );
}