export type Recipe = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  category?: string;
  servings?: number;
  prep_time?: number;
  cook_time?: number;
  ingredients?: Array<{ amount?: string; name?: string }>;
  steps?: string[];
  tags?: string[];
  created_date?: string;
  updated_date?: string;
};

export type CommunityPost = {
  id: string;
  author_name: string;
  content: string;
  recipe_id?: string;
  recipe_name?: string;
  recipe_image?: string;
  like_count: number;
  share_count: number;
  created_date: string;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_date: string;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string;
  name?: string;
};

export type AuthResponse = {
  jwt?: string;
  email?: string;
  fullName?: string;
  full_name?: string;
};

export type MealPlan = {
  id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  recipe_id?: string;
  recipe_name?: string;
  recipe_image?: string;
  created_by_id?: string;
};
