const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8081/api").replace(/\/$/, "")

function buildUrl(path) {
  return `${API_BASE}${path}`
}
const BACKEND_BASE = API_BASE.replace(/\/api$/, '')
const TOKEN_KEY = 'savora_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function serializeIngredient(ingredient) {
  if (typeof ingredient === 'string') {
    return ingredient
  }
  return `${ingredient.amount || ''}|||${ingredient.name || ''}`
}

function deserializeIngredient(ingredient) {
  if (typeof ingredient !== 'string') {
    return ingredient
  }
  if (ingredient.includes('|||')) {
    const [amount, name] = ingredient.split('|||')
    return { amount, name }
  }
  return { amount: '', name: ingredient }
}

function normalizeRecipe(apiRecipe) {
  if (!apiRecipe) {
    return apiRecipe
  }

  return {
    id: apiRecipe.id,
    name: apiRecipe.name,
    description: apiRecipe.description,
    image_url: apiRecipe.imageUrl,
    category: apiRecipe.category?.toLowerCase?.() || apiRecipe.category,
    servings: apiRecipe.servings,
    prep_time: apiRecipe.prepTime,
    cook_time: apiRecipe.cookTime,
    ingredients: (apiRecipe.ingredients || []).map(deserializeIngredient),
    steps: apiRecipe.steps || [],
    tags: apiRecipe.tags || [],
    created_date: apiRecipe.createdDate,
    updated_date: apiRecipe.updatedDate,
  }
}

function denormalizeRecipe(recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.image_url,
    category: recipe.category ? recipe.category.toUpperCase() : null,
    servings: recipe.servings,
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    ingredients: (recipe.ingredients || []).map(serializeIngredient),
    steps: recipe.steps || [],
    tags: recipe.tags || [],
    createdById: recipe.created_by_id || 'local-user',
  }
}

function normalizeMealPlan(apiMealPlan) {
  return {
    id: apiMealPlan.id,
    date: apiMealPlan.date,
    meal_type: apiMealPlan.mealType?.toLowerCase?.() || apiMealPlan.mealType,
    recipe_id: apiMealPlan.recipeId,
    recipe_name: apiMealPlan.recipeName,
    recipe_image: apiMealPlan.recipeImage,
    created_by_id: apiMealPlan.createdById,
  }
}

function denormalizeMealPlan(mealPlan) {
  return {
    id: mealPlan.id,
    date: mealPlan.date,
    mealType: mealPlan.meal_type?.toUpperCase?.() || mealPlan.mealType?.toUpperCase?.(),
    recipeId: mealPlan.recipe_id || mealPlan.recipeId,
    recipeName: mealPlan.recipe_name,
    recipeImage: mealPlan.recipe_image,
    createdById: 'local-user',
  }
}

async function uploadFile({ file }) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(buildUrl('/files/upload'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  const absoluteUrl = data.fileUrl.startsWith('http') ? data.fileUrl : `${API_BASE.replace(/\/api$/, '')}${data.fileUrl}`
  return { file_url: absoluteUrl }
}

async function invokeOllama({ prompt, file_urls = [] }) {
  const result = await request('/ai/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      fileUrls: file_urls,
    }),
  })

  return {
    ...result,
    image_url: file_urls[0] || '',
  }
}

function normalizeCommunityPost(post) {
  if (!post) {
    return post
  }

  return {
    id: post.id,
    author_name: post.author_name || post.authorName || 'Anonymous',
    content: post.content || '',
    recipe_id: post.recipe_id || post.recipeId || '',
    recipe_name: post.recipe_name || post.recipeName || '',
    recipe_image: post.recipe_image || post.recipeImage || '',
    like_count: post.like_count ?? post.likeCount ?? 0,
    share_count: post.share_count ?? post.shareCount ?? 0,
    created_date: post.created_date || post.createdDate || new Date().toISOString(),
  }
}

function denormalizeCommunityPost(post) {
  return {
    id: post.id,
    author_name: post.author_name,
    content: post.content,
    recipe_id: post.recipe_id,
    recipe_name: post.recipe_name,
    recipe_image: post.recipe_image,
  }
}

function normalizeComment(comment) {
  if (!comment) {
    return comment
  }

  return {
    id: comment.id,
    post_id: comment.post_id || comment.postId || '',
    author_name: comment.author_name || comment.authorName || 'Anonymous',
    content: comment.content || '',
    created_date: comment.created_date || comment.createdDate || new Date().toISOString(),
  }
}

const LOCAL_ME = {
  id: 'local-user',
  name: 'Local User',
  full_name: 'Local User',
  email: 'local@savora.app',
}

export const base44 = {
  entities: {
    Recipe: {
      async get(id) {
        return normalizeRecipe(await request(`/recipes/${id}`))
      },
      async list() {
        const data = await request('/recipes')
        return data.map(normalizeRecipe)
      },
      async create(recipe) {
        const created = await request('/recipes', {
          method: 'POST',
          body: JSON.stringify(denormalizeRecipe(recipe)),
        })
        return normalizeRecipe(created)
      },
      async update(id, recipe) {
        const updated = await request(`/recipes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(denormalizeRecipe(recipe)),
        })
        return normalizeRecipe(updated)
      },
      async delete(id) {
        await request(`/recipes/${id}`, { method: 'DELETE' })
      },
      async filter(query = {}) {
        const allRecipes = await this.list()
        if (query.id) {
          return allRecipes.filter((recipe) => recipe.id === query.id)
        }
        return allRecipes
      },
    },
    MealPlan: {
      async filter(params = {}) {
        const data = await request('/meal-plans')
        const plans = data.map(normalizeMealPlan)
        return plans.filter((plan) => {
          const gte = !params.date?.$gte || plan.date >= params.date.$gte
          const lte = !params.date?.$lte || plan.date <= params.date.$lte
          return gte && lte
        })
      },
      async create(mealPlan) {
        const created = await request('/meal-plans', {
          method: 'POST',
          body: JSON.stringify(denormalizeMealPlan(mealPlan)),
        })
        return normalizeMealPlan(created)
      },
      async delete(id) {
        await request(`/meal-plans/${id}`, { method: 'DELETE' })
      },
    },
    User: {
      async get(id) {
        if (id === 'me') {
          return base44.auth.me()
        }
        return { ...LOCAL_ME, id }
      },
      async delete() {
        return null
      },
    },
    CommunityPost: {
      async list() {
        const data = await request('/community/posts')
        return data.map(normalizeCommunityPost)
      },
      async create(post) {
        const created = await request('/community/posts', {
          method: 'POST',
          body: JSON.stringify(denormalizeCommunityPost(post)),
        })
        return normalizeCommunityPost(created)
      },
    },
    Post: {
      async create(post) {
        return base44.entities.CommunityPost.create(post)
      },
      async like(postId) {
        const updated = await request(`/community/posts/${postId}/like`, {
          method: 'POST',
        })
        return normalizeCommunityPost(updated)
      },
      async share(postId) {
        const updated = await request(`/community/posts/${postId}/share`, {
          method: 'POST',
        })
        return normalizeCommunityPost(updated)
      },
    },
    Comment: {
      async list(_sort, filter = {}) {
        if (!filter.post_id) {
          return []
        }
        const data = await request(`/community/posts/${filter.post_id}/comments`)
        return data.map(normalizeComment)
      },
      async create(comment) {
        const created = await request(`/community/posts/${comment.post_id}/comments`, {
          method: 'POST',
          body: JSON.stringify({
            author_name: comment.author_name,
            content: comment.content,
          }),
        })
        return normalizeComment(created)
      },
    },
  },
  auth: {
    async me() {
      const token = getToken()
      if (!token) {
        return LOCAL_ME
      }

      try {
        return await request('/auth/me')
      } catch (_error) {
        clearToken()
        return LOCAL_ME
      }
    },
    setToken,
    async loginViaEmailPassword(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (data?.jwt) {
        setToken(data.jwt)
      }
      return data
    },
    async register({ email, password, fullName }) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      })
      if (data?.jwt) {
        setToken(data.jwt)
      }
      return data
    },
    loginWithProvider(provider, redirect = '/') {
      const redirectPath = encodeURIComponent(redirect)
      window.location.href = `${BACKEND_BASE}/oauth2/authorization/${provider}?redirect=${redirectPath}`
      return null
    },
    async verifyOtp() {
      throw new Error('OTP verification is not enabled in backend yet.')
    },
    async resendOtp() {
      throw new Error('OTP resend is not enabled in backend yet.')
    },
    async resetPasswordRequest() {
      throw new Error('Password reset is not enabled in backend yet.')
    },
    async resetPassword() {
      throw new Error('Password reset is not enabled in backend yet.')
    },
    logout(redirectTo = '/login') {
      clearToken()
      if (redirectTo) {
        window.location.href = redirectTo
      }
      return null
    },
  },
  integrations: {
    Core: {
      UploadFile: uploadFile,
      async InvokeLLM({ prompt, file_urls }) {
        return invokeOllama({ prompt, file_urls })
      },
    },
  },
}

export default base44