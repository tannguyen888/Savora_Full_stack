import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { design } from "@/lib/design";

type IngredientRow = { amount: string; name: string };

const CATEGORIES = ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"];

function parseAiJsonLike(input: unknown): any {
  if (!input) return null;
  if (typeof input === "object") return input;
  if (typeof input !== "string") return null;

  const clean = input
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function getRecipePayload(raw: any) {
  const parsed = parseAiJsonLike(raw);
  const nestedRaw = parsed?.recipe ?? parsed?.response ?? parsed?.content ?? raw?.recipe ?? raw?.response ?? raw?.content ?? raw;
  const nestedParsed = parseAiJsonLike(nestedRaw);
  const root = nestedParsed?.recipe ?? nestedParsed ?? nestedRaw;
  return typeof root === "object" ? root : {};
}

export default function NewRecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ amount: "", name: "" }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanPreview, setScanPreview] = useState("");
  const [scanFileUrl, setScanFileUrl] = useState("");
  const hydratedRef = useRef(false);
  const { width } = useWindowDimensions();
  const compactHeaderActions = width < 430;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: existingRecipe, isLoading: isLoadingExisting } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => savouraClient.entities.Recipe.get(id as string),
    enabled: isEditMode
  });

  useEffect(() => {
    if (!existingRecipe || hydratedRef.current) return;

    setName(existingRecipe.name ?? "");
    setDescription(existingRecipe.description ?? "");
    setCategory((existingRecipe.category ?? "").toLowerCase());
    setServings(existingRecipe.servings ? String(existingRecipe.servings) : "");
    setPrepTime(existingRecipe.prep_time ? String(existingRecipe.prep_time) : "");
    setCookTime(existingRecipe.cook_time ? String(existingRecipe.cook_time) : "");
    setTags(Array.isArray(existingRecipe.tags) ? existingRecipe.tags.join(", ") : "");
    setImageUrl(existingRecipe.image_url ?? "");

    const normalizedIngredients = (existingRecipe.ingredients ?? []).map((item: { amount?: string; name?: string }) => ({
      amount: item.amount ?? "",
      name: item.name ?? ""
    }));
    setIngredients(normalizedIngredients.length ? normalizedIngredients : [{ amount: "", name: "" }]);

    const normalizedSteps = (existingRecipe.steps ?? []).map((step: string) => String(step));
    setSteps(normalizedSteps.length ? normalizedSteps : [""]);
    hydratedRef.current = true;
  }, [existingRecipe]);

  const cleanIngredients = useMemo(
    () => ingredients.filter((item) => item.name.trim()).map((item) => ({ amount: item.amount, name: item.name })),
    [ingredients]
  );

  const cleanSteps = useMemo(() => steps.map((step) => step.trim()).filter(Boolean), [steps]);

  const applyAiResult = (raw: any) => {
    const payload = getRecipePayload(raw);
    setName(payload.name ?? payload.title ?? "");
    setDescription(payload.description ?? "");
    setCategory((payload.category ?? "").toLowerCase?.() ?? "");
    setServings(payload.servings ? String(payload.servings) : "");
    setPrepTime(payload.prepTime ? String(payload.prepTime) : payload.prep_time ? String(payload.prep_time) : "");
    setCookTime(payload.cookTime ? String(payload.cookTime) : payload.cook_time ? String(payload.cook_time) : "");
    setTags(Array.isArray(payload.tags) ? payload.tags.join(", ") : "");
    setImageUrl(payload.image_url ?? payload.imageUrl ?? raw?.image_url ?? "");

    const ingredientData = Array.isArray(payload.ingredients) ? payload.ingredients : [];
    const nextIngredients = ingredientData.length
      ? ingredientData.map((item: any) => {
          if (typeof item === "string") return { amount: "", name: item };
          return { amount: item.amount ?? "", name: item.name ?? "" };
        })
      : [{ amount: "", name: "" }];
    setIngredients(nextIngredients);

    const stepData = Array.isArray(payload.steps)
      ? payload.steps
      : Array.isArray(payload.instructions)
      ? payload.instructions
      : [];
    const nextSteps = stepData.length
      ? stepData.map((s: any) => (typeof s === "string" ? s : s.step ?? "")).filter(Boolean)
      : [""];
    setSteps(nextSteps);

    if (!payload?.name && !payload?.title) {
      Alert.alert("AI Notice", "AI phản hồi nhưng không đúng định dạng recipe JSON. Bạn thử prompt cụ thể hơn nhé.");
    }
  };

  const aiGenerateMutation = useMutation({
    mutationFn: () =>
      savouraClient.integrations.Core.InvokeLLM({
        prompt: `Generate a complete, detailed recipe for: "${aiPrompt}". Return only structured recipe JSON.`
      }),
    onSuccess: (result) => {
      applyAiResult(result);
      setAiOpen(false);
      setAiPrompt("");
    },
    onError: () => {
      Alert.alert(
        "AI Error",
        "Không gọi được AI. Kiểm tra backend /api/ai/generate và cấu hình provider (OpenRouter/Ollama) rồi thử lại."
      );
    }
  });

  const scanUploadMutation = useMutation({
    mutationFn: async (fromCamera: boolean) => {
      const pickerResult = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true
          });

      if (pickerResult.canceled || !pickerResult.assets?.[0]) return null;
      const asset = pickerResult.assets[0];
      setScanPreview(asset.uri);

      const filePayload: any = {
        uri: asset.uri,
        name: asset.fileName || `ingredient-${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg"
      };

      const uploaded = await savouraClient.integrations.Core.UploadFile({ file: filePayload });
      return uploaded.file_url;
    },
    onSuccess: (fileUrl) => {
      if (fileUrl) setScanFileUrl(fileUrl);
    },
    onError: () => {
      Alert.alert("Upload Error", "Could not upload ingredient image.");
    }
  });

  const scanGenerateMutation = useMutation({
    mutationFn: () =>
      savouraClient.integrations.Core.InvokeLLM({
        prompt: "Look at this image, identify the visible ingredients, and generate one realistic recipe as JSON.",
        file_urls: [scanFileUrl]
      }),
    onSuccess: (result) => {
      applyAiResult(result);
      setScanOpen(false);
      setScanPreview("");
      setScanFileUrl("");
    },
    onError: () => {
      Alert.alert(
        "AI Error",
        "Không generate được từ ảnh nguyên liệu. Kiểm tra upload ảnh và backend AI service rồi thử lại."
      );
    }
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      isEditMode
        ? savouraClient.entities.Recipe.update(id as string, {
            name,
            description,
            category,
            servings: servings ? Number(servings) : undefined,
            prep_time: prepTime ? Number(prepTime) : undefined,
            cook_time: cookTime ? Number(cookTime) : undefined,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            image_url: imageUrl || undefined,
            ingredients: cleanIngredients,
            steps: cleanSteps
          })
        : savouraClient.entities.Recipe.create({
            name,
            description,
            category,
            servings: servings ? Number(servings) : undefined,
            prep_time: prepTime ? Number(prepTime) : undefined,
            cook_time: cookTime ? Number(cookTime) : undefined,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            image_url: imageUrl || undefined,
            ingredients: cleanIngredients,
            steps: cleanSteps
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      }
      router.replace("/recipes");
    },
    onError: () => {
      Alert.alert("Error", isEditMode ? "Could not update recipe." : "Could not create recipe.");
    }
  });

  if (isEditMode && isLoadingExisting && !hydratedRef.current) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: design.color.background }}>
        <ActivityIndicator color={design.color.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1" style={{ backgroundColor: design.color.background }} contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: design.color.border }}>
              <Ionicons name="arrow-back" size={16} color={design.color.foreground} />
            </Pressable>
            <Text
              numberOfLines={1}
              className={compactHeaderActions ? "text-3xl font-bold" : "text-4xl font-bold"}
              style={{ color: design.color.foreground, fontFamily: design.font.heading }}
            >
              {isEditMode ? "Edit Recipe" : "Công Thức Mới"}
            </Text>
          </View>
          <View className="shrink-0 flex-row items-center gap-2">
            <Pressable
              onPress={() => setAiOpen(true)}
              className={compactHeaderActions ? "h-9 w-9 items-center justify-center rounded-full border" : "rounded-full border px-3 py-2"}
              style={{ borderColor: "#e8c6a8", backgroundColor: "#fff6ef" }}
            >
              {compactHeaderActions ? (
                <Ionicons name="sparkles-outline" size={16} color="#996444" />
              ) : (
                <Text className="text-xs font-semibold" style={{ color: "#996444" }}>Generate with AI</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => setScanOpen(true)}
              className={compactHeaderActions ? "h-9 w-9 items-center justify-center rounded-full border" : "rounded-full border px-3 py-2"}
              style={{ borderColor: "#b8dfbf", backgroundColor: "#eef9f0" }}
            >
              {compactHeaderActions ? (
                <Ionicons name="camera-outline" size={16} color="#4a9c57" />
              ) : (
                <Text className="text-xs font-semibold" style={{ color: "#4a9c57" }}>Scan Ingredients</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
        >
          <Text className="text-xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>Basic Information</Text>

          <Text className="mt-4 text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Recipe Name *</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Creamy Tomato Pasta" className="mt-1 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />

          <Text className="mt-3 text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="A short description..." multiline className="mt-1 min-h-[90px] rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />

          <Text className="mt-3 text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Category</Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <Pressable key={item} onPress={() => setCategory(item)} className="rounded-full border px-3 py-1.5" style={{ borderColor: active ? design.color.primary : design.color.border, backgroundColor: active ? design.color.primary : design.color.card }}>
                  <Text className="text-xs font-semibold capitalize" style={{ color: active ? "#fff" : design.color.mutedForeground }}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-3 flex-row gap-2">
            <View className="flex-1">
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Servings</Text>
              <TextInput value={servings} onChangeText={setServings} keyboardType="number-pad" placeholder="4" className="mt-1 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Prep Time (min)</Text>
              <TextInput value={prepTime} onChangeText={setPrepTime} keyboardType="number-pad" placeholder="15" className="mt-1 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Cook Time (min)</Text>
              <TextInput value={cookTime} onChangeText={setCookTime} keyboardType="number-pad" placeholder="30" className="mt-1 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />
            </View>
          </View>

          <Text className="mt-3 text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Tags</Text>
          <TextInput value={tags} onChangeText={setTags} placeholder="vegetarian, quick, healthy" className="mt-1 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />

          <Text className="mt-5 text-xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>Photo</Text>
          <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="Or paste image URL" className="mt-2 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />

          <Text className="mt-5 text-xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>Ingredients</Text>
          <View className="mt-2 gap-2">
            {ingredients.map((item, index) => (
              <View key={`ing-${index}`} className="flex-row items-center gap-2">
                <TextInput
                  value={item.amount}
                  onChangeText={(value) => setIngredients((prev) => prev.map((p, i) => (i === index ? { ...p, amount: value } : p)))}
                  placeholder="Amount"
                  className="w-28 rounded-xl border px-3 py-2.5"
                  style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
                  placeholderTextColor={design.color.mutedForeground}
                />
                <TextInput
                  value={item.name}
                  onChangeText={(value) => setIngredients((prev) => prev.map((p, i) => (i === index ? { ...p, name: value } : p)))}
                  placeholder="Ingredient name"
                  className="flex-1 rounded-xl border px-3 py-2.5"
                  style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
                  placeholderTextColor={design.color.mutedForeground}
                />
              </View>
            ))}
            <Pressable onPress={() => setIngredients((prev) => [...prev, { amount: "", name: "" }])} className="self-start rounded-full border px-3 py-1.5" style={{ borderColor: design.color.border }}>
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>+ Add Ingredient</Text>
            </Pressable>
          </View>

          <Text className="mt-5 text-xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>Steps</Text>
          <View className="mt-2 gap-2">
            {steps.map((step, index) => (
              <TextInput
                key={`step-${index}`}
                value={step}
                onChangeText={(value) => setSteps((prev) => prev.map((p, i) => (i === index ? value : p)))}
                placeholder={`Step ${index + 1}...`}
                multiline
                className="min-h-[78px] rounded-xl border px-4 py-3"
                style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }}
                placeholderTextColor={design.color.mutedForeground}
              />
            ))}
            <Pressable onPress={() => setSteps((prev) => [...prev, ""])} className="self-start rounded-full border px-3 py-1.5" style={{ borderColor: design.color.border }}>
              <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>+ Add Step</Text>
            </Pressable>
          </View>

          <View className="mt-5 border-t pt-4" style={{ borderColor: design.color.border }}>
            <Pressable
              onPress={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !name.trim()}
              className="self-end rounded-full px-5 py-2.5"
              style={{ backgroundColor: design.color.primary, opacity: saveMutation.isPending || !name.trim() ? 0.65 : 1 }}
            >
              <Text className="text-sm font-semibold text-white">
                {saveMutation.isPending ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Changes" : "Create Recipe"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={aiOpen} transparent animationType="fade" onRequestClose={() => setAiOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/35 px-5">
          <View className="w-full rounded-2xl p-4" style={{ backgroundColor: design.color.card }}>
            <Text className="text-xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>Generate with AI</Text>
            <TextInput value={aiPrompt} onChangeText={setAiPrompt} placeholder="Nhập tên món ăn..." className="mt-3 rounded-xl border px-4 py-3" style={{ borderColor: design.color.border, color: design.color.foreground, backgroundColor: design.color.card }} placeholderTextColor={design.color.mutedForeground} />
            <View className="mt-3 flex-row justify-end gap-2">
              <Pressable onPress={() => setAiOpen(false)} className="rounded-full border px-4 py-2" style={{ borderColor: design.color.border }}>
                <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Close</Text>
              </Pressable>
              <Pressable onPress={() => aiGenerateMutation.mutate()} disabled={!aiPrompt.trim() || aiGenerateMutation.isPending} className="rounded-full px-4 py-2" style={{ backgroundColor: design.color.primary, opacity: !aiPrompt.trim() || aiGenerateMutation.isPending ? 0.7 : 1 }}>
                <Text className="text-xs font-semibold text-white">{aiGenerateMutation.isPending ? "Generating..." : "Generate"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={scanOpen} transparent animationType="fade" onRequestClose={() => setScanOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/35 px-5">
          <View className="w-full rounded-2xl p-4" style={{ backgroundColor: design.color.card }}>
            <Text className="text-xl font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>Scan Ingredients</Text>
            <Text className="mt-1 text-xs" style={{ color: design.color.mutedForeground }}>Chọn ảnh có sẵn hoặc mở camera để AI phân tích nguyên liệu.</Text>

            <View className="mt-3 flex-row gap-2">
              <Pressable onPress={() => scanUploadMutation.mutate(false)} className="flex-1 rounded-xl border px-3 py-3" style={{ borderColor: design.color.border }}>
                <Text className="text-center text-xs font-semibold" style={{ color: design.color.foreground }}>Upload Photo</Text>
              </Pressable>
              <Pressable onPress={() => scanUploadMutation.mutate(true)} className="flex-1 rounded-xl border px-3 py-3" style={{ borderColor: design.color.border }}>
                <Text className="text-center text-xs font-semibold" style={{ color: design.color.foreground }}>Open Camera</Text>
              </Pressable>
            </View>

            {!!scanPreview && (
              <Text className="mt-2 text-xs" style={{ color: design.color.mutedForeground }} numberOfLines={1}>
                Selected: {scanPreview}
              </Text>
            )}

            <View className="mt-3 flex-row justify-end gap-2">
              <Pressable onPress={() => { setScanOpen(false); setScanPreview(""); setScanFileUrl(""); }} className="rounded-full border px-4 py-2" style={{ borderColor: design.color.border }}>
                <Text className="text-xs font-semibold" style={{ color: design.color.mutedForeground }}>Close</Text>
              </Pressable>
              <Pressable onPress={() => scanGenerateMutation.mutate()} disabled={!scanFileUrl || scanGenerateMutation.isPending || scanUploadMutation.isPending} className="rounded-full px-4 py-2" style={{ backgroundColor: "#6bb57b", opacity: !scanFileUrl || scanGenerateMutation.isPending || scanUploadMutation.isPending ? 0.7 : 1 }}>
                <Text className="text-xs font-semibold text-white">{scanGenerateMutation.isPending ? "Generating..." : "Generate Recipe"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
