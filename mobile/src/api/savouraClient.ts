import { apiRequest } from "@/api/client";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/authStorage";
import { AuthResponse, CommunityComment, CommunityPost, MealPlan, Recipe, UserProfile } from "@/types/domain";
import { Linking, Platform } from "react-native";

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8081").replace(/\/$/, "");
const API_BASE_WITH_API = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;
const BACKEND_BASE = API_BASE_WITH_API.replace(/\/api$/, "");

function serializeIngredient(ingredient: { amount?: string; name?: string } | string) {
  if (typeof ingredient === "string") return ingredient;
  return `${ingredient.amount ?? ""}|||${ingredient.name ?? ""}`;
}

function deserializeIngredient(ingredient: unknown) {
  if (typeof ingredient !== "string") {
    return ingredient as { amount?: string; name?: string };
  }
  if (!ingredient.includes("|||")) {
    return { amount: "", name: ingredient };
  }
  const [amount, name] = ingredient.split("|||");
  return { amount, name };
}

function normalizeRecipe(apiRecipe: any): Recipe {
  return {
    id: apiRecipe.id,
    name: apiRecipe.name,
    description: apiRecipe.description,
    image_url: apiRecipe.imageUrl,
    category: apiRecipe.category?.toLowerCase?.() ?? apiRecipe.category,
    servings: apiRecipe.servings,
    prep_time: apiRecipe.prepTime,
    cook_time: apiRecipe.cookTime,
    ingredients: (apiRecipe.ingredients ?? []).map(deserializeIngredient),
    steps: apiRecipe.steps ?? [],
    tags: apiRecipe.tags ?? [],
    created_date: apiRecipe.createdDate,
    updated_date: apiRecipe.updatedDate
  };
}

function denormalizeRecipe(recipe: Partial<Recipe>) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.image_url,
    category: recipe.category?.toUpperCase(),
    servings: recipe.servings,
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    ingredients: (recipe.ingredients ?? []).map(serializeIngredient),
    steps: recipe.steps ?? [],
    tags: recipe.tags ?? [],
    createdById: "mobile-user"
  };
}

function normalizePost(post: any): CommunityPost {
  return {
    id: post.id,
    author_name: post.author_name ?? post.authorName ?? "Anonymous",
    content: post.content ?? "",
    recipe_id: post.recipe_id ?? post.recipeId ?? "",
    recipe_name: post.recipe_name ?? post.recipeName ?? "",
    recipe_image: post.recipe_image ?? post.recipeImage ?? "",
    like_count: post.like_count ?? post.likeCount ?? 0,
    share_count: post.share_count ?? post.shareCount ?? 0,
    created_date: post.created_date ?? post.createdDate ?? new Date().toISOString()
  };
}

function normalizeComment(comment: any): CommunityComment {
  return {
    id: comment.id,
    post_id: comment.post_id ?? comment.postId ?? "",
    author_name: comment.author_name ?? comment.authorName ?? "Anonymous",
    content: comment.content ?? "",
    created_date: comment.created_date ?? comment.createdDate ?? new Date().toISOString()
  };
}

function normalizeMealPlan(apiMealPlan: any): MealPlan {
  return {
    id: apiMealPlan.id,
    date: apiMealPlan.date,
    meal_type: (apiMealPlan.mealType?.toLowerCase?.() ?? apiMealPlan.meal_type ?? "breakfast") as MealPlan["meal_type"],
    recipe_id: apiMealPlan.recipeId ?? apiMealPlan.recipe_id,
    recipe_name: apiMealPlan.recipeName ?? apiMealPlan.recipe_name,
    recipe_image: apiMealPlan.recipeImage ?? apiMealPlan.recipe_image,
    created_by_id: apiMealPlan.createdById ?? apiMealPlan.created_by_id
  };
}

function denormalizeMealPlan(mealPlan: Partial<MealPlan>) {
  return {
    date: mealPlan.date,
    mealType: mealPlan.meal_type?.toUpperCase(),
    recipeId: mealPlan.recipe_id,
    recipeName: mealPlan.recipe_name,
    recipeImage: mealPlan.recipe_image,
    createdById: "mobile-user"
  };
}

async function authRequest(path: string, body?: object) {
  return apiRequest<AuthResponse>(path, {
    method: "POST",
    body: JSON.stringify(body ?? {})
  });
}

async function uploadFile({ file }: { file: any }) {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_WITH_API}/files/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  const raw = data?.fileUrl ?? data?.file_url ?? "";
  const file_url = typeof raw === "string" && raw.startsWith("http") ? raw : `${BACKEND_BASE}${raw}`;
  return { file_url };
}

async function invokeOllama({ prompt, file_urls = [] }: { prompt: string; file_urls?: string[] }) {
  const result = await apiRequest<any>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      fileUrls: file_urls
    })
  });

  return {
    ...result,
    image_url: file_urls[0] || ""
  };
}

export const savouraClient = {
  entities: {
    Recipe: {
      async list() {
        const data = await apiRequest<any[]>("/api/recipes");
        return data.map(normalizeRecipe);
      },
      async get(id: string) {
        const data = await apiRequest<any>(`/api/recipes/${id}`);
        return normalizeRecipe(data);
      },
      async create(recipe: Partial<Recipe>) {
        const data = await apiRequest<any>("/api/recipes", {
          method: "POST",
          body: JSON.stringify(denormalizeRecipe(recipe))
        });
        return normalizeRecipe(data);
      },
      async update(id: string, recipe: Partial<Recipe>) {
        const data = await apiRequest<any>(`/api/recipes/${id}`, {
          method: "PUT",
          body: JSON.stringify(denormalizeRecipe(recipe))
        });
        return normalizeRecipe(data);
      },
      async delete(id: string) {
        await apiRequest<void>(`/api/recipes/${id}`, {
          method: "DELETE"
        });
      }
    },
    CommunityPost: {
      async list() {
        const data = await apiRequest<any[]>("/api/community/posts");
        return data.map(normalizePost);
      },
      async create(post: Partial<CommunityPost>) {
        const data = await apiRequest<any>("/api/community/posts", {
          method: "POST",
          body: JSON.stringify({
            author_name: post.author_name,
            content: post.content,
            recipe_id: post.recipe_id,
            recipe_name: post.recipe_name,
            recipe_image: post.recipe_image
          })
        });
        return normalizePost(data);
      }
    },
    Post: {
      async like(postId: string) {
        const data = await apiRequest<any>(`/api/community/posts/${postId}/like`, {
          method: "POST"
        });
        return normalizePost(data);
      },
      async share(postId: string) {
        const data = await apiRequest<any>(`/api/community/posts/${postId}/share`, {
          method: "POST"
        });
        return normalizePost(data);
      }
    },
    Comment: {
      async list(postId: string) {
        const data = await apiRequest<any[]>(`/api/community/posts/${postId}/comments`);
        return data.map(normalizeComment);
      },
      async create(payload: { post_id: string; author_name: string; content: string }) {
        const data = await apiRequest<any>(`/api/community/posts/${payload.post_id}/comments`, {
          method: "POST",
          body: JSON.stringify({
            author_name: payload.author_name,
            content: payload.content
          })
        });
        return normalizeComment(data);
      }
    },
    MealPlan: {
      async filter(params?: { date?: { $gte?: string; $lte?: string } }) {
        const data = await apiRequest<any[]>("/api/meal-plans");
        const plans = data.map(normalizeMealPlan);

        if (!params?.date?.$gte && !params?.date?.$lte) return plans;

        return plans.filter((plan) => {
          const gte = !params?.date?.$gte || plan.date >= params.date.$gte;
          const lte = !params?.date?.$lte || plan.date <= params.date.$lte;
          return gte && lte;
        });
      },
      async create(mealPlan: Partial<MealPlan>) {
        const data = await apiRequest<any>("/api/meal-plans", {
          method: "POST",
          body: JSON.stringify(denormalizeMealPlan(mealPlan))
        });
        return normalizeMealPlan(data);
      },
      async delete(id: string) {
        await apiRequest<void>(`/api/meal-plans/${id}`, {
          method: "DELETE"
        });
      }
    },
    User: {
      async delete(id: string) {
        await apiRequest<void>(`/api/users/${id}`, {
          method: "DELETE"
        });
      }
    }
  },
  auth: {
    async setToken(token?: string) {
      await setAuthToken(token);
    },
    async getToken() {
      return getAuthToken();
    },
    async me(): Promise<UserProfile> {
      return apiRequest<UserProfile>("/api/auth/me");
    },
    async loginViaEmailPassword(email: string, password: string) {
      const data = await authRequest("/api/auth/login", { email, password });
      if (data?.jwt) {
        await setAuthToken(data.jwt);
      }
      return data;
    },
    async register({ email, password, fullName }: { email: string; password: string; fullName?: string }) {
      const data = await authRequest("/api/auth/register", { email, password, fullName });
      if (data?.jwt) {
        await setAuthToken(data.jwt);
      }
      return data;
    },
    async loginWithProvider(provider: "google", redirect = "/oauth-success") {
      const redirectTarget = (() => {
        if (redirect.startsWith("http://") || redirect.startsWith("https://")) {
          return redirect;
        }
        if (Platform.OS === "web") {
          const origin = globalThis.location?.origin ?? "http://localhost:19007";
          return `${origin}${redirect.startsWith("/") ? redirect : `/${redirect}`}`;
        }
        return redirect;
      })();

      const encodedRedirect = encodeURIComponent(redirectTarget);
      const url = `${BACKEND_BASE}/api/auth/login/${provider}?redirect=${encodedRedirect}`;
      await Linking.openURL(url);
      return url;
    },
    async logout() {
      await clearAuthToken();
      if (Platform.OS === "web") {
        globalThis.location.href = "/login";
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: uploadFile,
      async InvokeLLM({ prompt, file_urls }: { prompt: string; file_urls?: string[] }) {
        return invokeOllama({ prompt, file_urls });
      }
    }
  }
};

export const base44Mobile = savouraClient;

