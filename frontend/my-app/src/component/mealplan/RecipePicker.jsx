import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function RecipePicker({ open, onOpenChange, recipes, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Choose a Recipe</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="pl-9"
          />
        </div>
        <div className="max-h-72 overflow-y-auto space-y-1 mt-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No recipes found</p>
          ) : (
            filtered.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => { onSelect(recipe); onOpenChange(false); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
              >
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🍽️</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recipe.name}</p>
                  {recipe.category && (
                    <p className="text-xs text-muted-foreground capitalize">{recipe.category}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}