# Mobile Migration Status

## Completed

- Added isolated Expo mobile app in `mobile/`.
- Added mobile API adapter compatible with backend endpoints.
- Cloned core behavior of web `Recipes` list/filter screen into mobile tab.
- Cloned core behavior of web `Community` feed/composer/post actions into mobile tab.
- Added comments list/create flow in mobile post card.

## In progress

- Auth token persistence and authenticated user profile mapping.
- Recipe details + create/edit screens.
- Mobile PDF export via `expo-print`.

## Do not change

- `frontend/my-app/**`
- `backend/**`

## Definition of done for each converted screen

1. Mobile UI implemented with React Native components.
2. Uses backend API through `savouraClient`.
3. Uses TanStack Query for fetch/mutation + invalidation.
4. Keeps field names and query keys consistent with web.
5. No web/backend file modifications.

