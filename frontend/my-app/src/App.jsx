import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './component/layout/AppLayout'
import { LanguageProvider } from './lib/LanguageContext'
import { queryClientInstance } from './lib/querryClient'
import Community from './page/Community'
import Login from './page/loginPage'
import MealPlan from './page/MealPlan'
import OAuthSuccess from './page/OAuthSuccess'
import RecipeFormPage from './page/RecipeFormPage'
import RecipeDetail from './page/RecipesDetail'
import Register from './page/Register'
import Recipes from './page/Recipes'
import ResetPassword from './page/ResetPassword'
import ForgotPassword from './page/forgetPassword'
import Settings from './page/Settings'

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Recipes />} />
              <Route path="/recipe/new" element={<RecipeFormPage />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
              <Route path="/meal-plan" element={<MealPlan />} />
              <Route path="/community" element={<Community />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  )
}

export default App