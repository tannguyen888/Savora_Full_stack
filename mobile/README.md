# Savora Mobile (Expo)

This folder is a new mobile app scaffold that runs in parallel with existing web and backend code.

## Scope

- No existing web files were modified.
- No backend files were modified.
- Mobile UI is isolated under this folder.

## Tech stack

- Expo + Expo Router + TypeScript
- TanStack Query
- NativeWind
- Separate mobile-ready API client

## Quick start

1. Open terminal in this folder:

```bash
cd mobile
```

2. Install dependencies:

```bash
npm install
```

3. Configure backend base URL:

- Create `.env` in `mobile/` with:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

4. Run app:

```bash
npm run start
```

Then press:

- `a` for Android emulator
- `i` for iOS simulator (macOS)
- scan QR in Expo Go for device testing

## Current structure

- `app/`: Expo Router screens
- `src/api/`: mobile API client
- `src/lib/`: query client
- `src/providers/`: app providers

## Next conversion flow

When converting a web file to mobile:

1. Read web file for logic only.
2. Create a new mobile file under this folder.
3. Keep web file unchanged.
4. Adapt UI to React Native components.
