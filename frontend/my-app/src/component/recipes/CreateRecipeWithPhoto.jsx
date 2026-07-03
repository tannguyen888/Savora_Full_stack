import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import SoraBackend from "@/api/SoraBackendApi";

function CreateRecipeWithPhoto({ onGenerated }) {
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

    const { file_url } = await SoraBackend.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);

    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleGenerate = async () => {
    if (!uploadedUrl) return;

    setLoading(true);

    const result = await SoraBackend.integrations.Core.InvokeLLM({
      prompt: `
Look at this image and generate a complete recipe based on visible ingredients.

Return JSON with:
- name
- description
- category (breakfast, lunch, dinner, snack, dessert, drink)
- servings
- prep_time
- cook_time
- ingredients [{name, amount}]
- steps []
- tags []
      `,
      file_urls: [uploadedUrl],
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          servings: { type: "number" },
          prep_time: { type: "number" },
          cook_time: { type: "number" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "string" },
              },
            },
          },
          steps: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
        },
      },
    });

    setLoading(false);
    onGenerated?.(result);
    setOpen(false);
    setPreview(null);
    setUploadedUrl(null);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        <Camera className="mr-2 h-4 w-4" />
        Create Recipe from Photo
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between pr-4">
            <DrawerTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Create Recipe from Photo
            </DrawerTitle>

            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <Button
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-full rounded-lg"
              />
            )}

            <Button
              onClick={handleGenerate}
              disabled={!uploadedUrl || loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Recipe"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default CreateRecipeWithPhoto;