import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, X, Loader2, Image } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";

export default function IngredientScanner({ onGenerated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!uploadedUrl) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Look at this image, identify the visible ingredients, and generate one realistic recipe as JSON.",
        file_urls: [uploadedUrl],
      });

      onGenerated(result);
      setOpen(false);
      setPreview(null);
      setUploadedUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setUploadedUrl(null);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 border-accent/40 text-accent hover:bg-accent/5 no-select"
      >
        <Camera className="w-4 h-4" />
        Scan Ingredients
      </Button>

      <Drawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between pr-4">
            <DrawerTitle className="font-heading flex items-center gap-2">
              <Camera className="w-5 h-5 text-accent" />
              Scan Ingredients → Recipe
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="no-select"><X className="w-4 h-4" /></Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Take or upload a photo of your ingredients — AI will detect them and generate a recipe.
            </p>

            {!preview ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 hover:border-accent/50 hover:bg-accent/5 transition-colors no-select"
                >
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 hover:border-accent/50 hover:bg-accent/5 transition-colors no-select"
                >
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload Photo</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Ingredients" className="w-full max-h-56 object-cover" />
                {!loading && (
                  <button onClick={reset} className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 no-select">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {loading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}

            {preview && !loading && uploadedUrl && (
              <Button
                onClick={handleGenerate}
                className="w-full gap-2 bg-accent hover:bg-accent/90 no-select"
              >
                <Sparkles className="w-4 h-4" />
                Generate Recipe from Photo
              </Button>
            )}

            {loading && !preview && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}