import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, X, Loader2 } from "lucide-react";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose,
} from "@/components/ui/drawer";

export default function AIRecipeGenerator({ onGenerated }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete, detailed recipe for: "${prompt}". Return only structured recipe JSON.`,
      });

      onGenerated(result);
      setOpen(false);
      setPrompt("");
    } catch (err) {
      setError(err.message || "Failed to generate recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/5 no-select"
      >
        <Sparkles className="w-4 h-4" />
        Generate with AI
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between pr-4">
            <DrawerTitle className="font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Recipe Generator
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="no-select">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe a dish and AI will generate a complete recipe for you.
            </p>
            <Input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. spicy Thai basil chicken, classic tiramisu…"
              onKeyDown={e => e.key === "Enter" && !loading && handleGenerate()}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full gap-2 bg-primary hover:bg-primary/90 no-select"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating recipe…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Recipe
                </>
              )}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}