import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8081/api",
  headers: { "Content-Type": "application/json" },
});

export default api;

export const savouraClient = {
  // Generic HTTP methods
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),

  // Entity-specific shortcuts used by the app
  entities: {
    Recipe: {
      // GET /recipes/{id}
      get: (id) => api.get(`/recipes/${id}`),
      // GET /recipes?order=...
      list: (order) => api.get("/recipes", { params: { order } }),
      // POST /recipes
      create: (data) => api.post("/recipes", data),
      // PUT /recipes/{id}
      update: (id, data) => api.put(`/recipes/${id}`, data),
      // DELETE /recipes/{id}
      delete: (id) => api.delete(`/recipes/${id}`),



      // Compatibility shim for the old `filter` call
      filter: (query) => api.get("/recipes", { params: query }),
    },
    MealPlan: {
      filter: (params) => api.get("/mealPlans", { params }),
      create: (data) => api.post("/mealPlans", data),
      delete: (id) => api.delete(`/mealPlans/${id}`),
    },
    auth: {
      loginViaEmailPassword: (email, password) =>
        api.post("/auth/login", { email, password }),
      loginWithProvider: (provider, redirect) =>
        api.post(`/auth/login/${provider}`, { redirect }),
      resetPasswordRequest: (email) => api.post("/auth/reset-password", { email }),
    },
  },
};

export const base44 = savouraClient;