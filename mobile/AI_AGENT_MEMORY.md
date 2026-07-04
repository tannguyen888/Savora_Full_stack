# AI Agent Memory - Savora Mobile

## Guardrails

- Never edit or delete web files under `frontend/my-app`.
- Never edit backend files under `backend/` for mobile tasks.
- Every conversion from web must create new files under `mobile/`.

## Source-of-truth mappings (web -> mobile)

- Web router: `frontend/my-app/src/App.jsx`
- Web API adapter: `frontend/my-app/src/api/Client.js`
- Community page: `frontend/my-app/src/page/Community.jsx`
- Recipes page: `frontend/my-app/src/page/Recipes.jsx`
- Post card behavior: `frontend/my-app/src/component/community/PostCard.jsx`

## Mobile equivalents

- Mobile router: `mobile/app/(tabs)/*`
- Mobile API adapter: `mobile/src/api/savouraClient.ts`
- Community screen: `mobile/app/(tabs)/community.tsx`
- Recipes screen: `mobile/app/(tabs)/recipes.tsx`
- Community components:
  - `mobile/src/components/community/PostComposerMobile.tsx`
  - `mobile/src/components/community/PostCardMobile.tsx`
  - `mobile/src/components/community/CommentSectionMobile.tsx`
- Recipe components:
  - `mobile/src/components/recipes/RecipeFiltersMobile.tsx`
  - `mobile/src/components/recipes/RecipeCardMobile.tsx`

## API contract used by mobile

- `GET /api/recipes`
- `GET /api/recipes/{id}`
- `POST /api/recipes`
- `GET /api/community/posts`
- `POST /api/community/posts`
- `POST /api/community/posts/{postId}/like`
- `POST /api/community/posts/{postId}/share`
- `GET /api/community/posts/{postId}/comments`
- `POST /api/community/posts/{postId}/comments`

## Naming consistency rules

- Keep snake_case fields aligned with existing web usage:
  - `author_name`, `recipe_id`, `recipe_image`, `created_date`
- Keep query keys aligned with web for easy compare:
  - `recipes`, `communityPosts`, `comments`

## Next conversions planned

- Recipe detail screen (`/recipe/:id` web -> `app/recipe/[id].tsx` mobile)
- Auth flow (`login/register/me` using backend JWT)
- Mobile PDF export via `expo-print` (separate from web jsPDF)

## Working style

- Read only minimal source files listed above before each conversion.
- Append updates in this file whenever mapping or contract changes.
- Keep components small and business logic in API adapter/hooks.

