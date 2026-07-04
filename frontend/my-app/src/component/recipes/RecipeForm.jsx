import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose,
} from "@/components/ui/drawer";
import { Plus, Trash2, GripVertical, Upload, ChevronDown } from "lucide-react";
import { savouraClient } from "@/api/savouraClient";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORIES = ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"];

// Mobile-friendly select: Drawer on mobile, standard Select on desktop
function CategorySelect({ value, onChange }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : "Select category";

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 no-select"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>{label}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="font-heading">Select Category</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-1">
              {CATEGORIES.map(c => (
                <DrawerClose key={c} asChild>
                  <button
                    type="button"
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors no-select ${
                      value === c
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                </DrawerClose>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
      <SelectContent>
        {CATEGORIES.map(c => (
          <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function RecipeForm({ recipe, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    name: recipe?.name || "",
    description: recipe?.description || "",
    image_url: recipe?.image_url || "",
    category: recipe?.category || "",
    servings: recipe?.servings || "",
    prep_time: recipe?.prep_time || "",
    cook_time: recipe?.cook_time || "",
    ingredients: recipe?.ingredients?.length ? recipe.ingredients : [{ name: "", amount: "" }],
    steps: recipe?.steps?.length ? recipe.steps : [""],
    tags: recipe?.tags?.join(", ") || "",
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...form.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setForm(prev => ({ ...prev, ingredients: updated }));
  };

  const addIngredient = () => {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: "", amount: "" }] }));
  };

  const removeIngredient = (index) => {
    setForm(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  const handleStepChange = (index, value) => {
    const updated = [...form.steps];
    updated[index] = value;
    setForm(prev => ({ ...prev, steps: updated }));
  };

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, ""] }));
  };

  const removeStep = (index) => {
    setForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await savouraClient.integrations.Core.UploadFile({ file });
    handleChange("image_url", file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      servings: form.servings ? Number(form.servings) : undefined,
      prep_time: form.prep_time ? Number(form.prep_time) : undefined,
      cook_time: form.cook_time ? Number(form.cook_time) : undefined,
      ingredients: form.ingredients.filter(i => i.name.trim()),
      steps: form.steps.filter(s => s.trim()),
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      category: form.category || undefined,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-semibold">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="name">Recipe Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="e.g. Creamy Tomato Pasta"
              required
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              placeholder="A short description of this recipe..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <CategorySelect value={form.category} onChange={v => handleChange("category", v)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input id="servings" type="number" min="1" value={form.servings} onChange={e => handleChange("servings", e.target.value)} placeholder="4" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prep_time">Prep Time (min)</Label>
            <Input id="prep_time" type="number" min="0" value={form.prep_time} onChange={e => handleChange("prep_time", e.target.value)} placeholder="15" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cook_time">Cook Time (min)</Label>
            <Input id="cook_time" type="number" min="0" value={form.cook_time} onChange={e => handleChange("cook_time", e.target.value)} placeholder="30" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" value={form.tags} onChange={e => handleChange("tags", e.target.value)} placeholder="vegetarian, quick, healthy (comma separated)" />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-semibold">Photo</h3>
        <div className="flex items-start gap-4">
          {form.image_url ? (
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border">
              <img src={form.image_url} alt="Recipe" className="w-full h-full object-cover" />
              <button type="button" onClick={() => handleChange("image_url", "")} className="absolute top-1 right-1 bg-background/80 rounded-full p-1 no-select">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="w-32 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors no-select">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Upload"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
          <div className="flex-1 space-y-2">
            <Label htmlFor="image_url">Or paste image URL</Label>
            <Input id="image_url" value={form.image_url} onChange={e => handleChange("image_url", e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-semibold">Ingredients</h3>
        <div className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <Input value={ing.amount} onChange={e => handleIngredientChange(i, "amount", e.target.value)} placeholder="Amount" className="w-28 shrink-0" />
              <Input value={ing.name} onChange={e => handleIngredientChange(i, "name", e.target.value)} placeholder="Ingredient name" className="flex-1" />
              {form.ingredients.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)} className="shrink-0 text-muted-foreground hover:text-destructive no-select">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="gap-2 no-select">
          <Plus className="w-4 h-4" /> Add Ingredient
        </Button>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-semibold">Steps</h3>
        <div className="space-y-3">
          {form.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0 mt-1 no-select">
                {i + 1}
              </div>
              <Textarea value={step} onChange={e => handleStepChange(i, e.target.value)} placeholder={`Step ${i + 1}...`} rows={2} className="flex-1" />
              {form.steps.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)} className="shrink-0 text-muted-foreground hover:text-destructive mt-1 no-select">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-2 no-select">
          <Plus className="w-4 h-4" /> Add Step
        </Button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="gap-2 bg-primary hover:bg-primary/90 min-w-[140px] no-select">
          {isSubmitting ? "Saving..." : recipe ? "Update Recipe" : "Create Recipe"}
        </Button>
      </div>
    </form>
  );
}
