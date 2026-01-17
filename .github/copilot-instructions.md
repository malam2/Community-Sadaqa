# Copilot Instructions for Community-Sadaqa

## Project Overview
A mosque-centered mutual aid platform (sadaqa/charity) built as an **Expo React Native** app with an **Express + PostgreSQL** backend. Connects community members who need help with those who can offer it.

## Architecture

### Monorepo Structure
- `client/` - Expo React Native app (iOS, Android, Web)
- `server/` - Express.js API server with Drizzle ORM
- `shared/` - Shared schema definitions (Drizzle tables + Zod validation)

### Data Flow
1. **Schema**: Define tables in `shared/schema.ts` using Drizzle + export Zod schemas
2. **Server**: Routes in `server/routes.ts` validate with shared Zod schemas, query via `db` from `server/db.ts`
3. **Client**: API calls in `client/lib/api.ts`, state via TanStack Query (`@tanstack/react-query`)

### Navigation Pattern
```
RootStackNavigator (auth check)
├── AuthStackNavigator (Login, Signup)
└── MainTabNavigator (Feed, Create, Profile tabs)
    ├── FeedStackNavigator → PostDetailScreen (modal)
    ├── CreatePost → PreviewPost → Success (modal flow)
    └── ProfileStackNavigator
```

## Key Conventions

### Theming
- Always use `useTheme()` hook from `@/hooks/useTheme` for colors
- Theme tokens in `client/constants/theme.ts`: `Colors`, `Spacing`, `BorderRadius`, `Typography`, `Shadows`
- Support both light/dark modes via `theme.backgroundRoot`, `theme.primary`, etc.

### Component Patterns
- Use `ThemedText` with `type` prop (`h1`, `h2`, `body`, `small`) instead of raw `Text`
- Wrap interactive elements in `react-native-reanimated` for press animations (see `PostCard.tsx`)
- Import path alias: `@/` maps to `client/` (e.g., `@/components/Button`)

### Forms
- Use `FormInput` component for text inputs with consistent styling
- `Dropdown` for selection, `Toggle` for boolean fields, `SegmentedControl` for type switching
- Haptic feedback via `expo-haptics` on important actions

### Type Definitions
- Post types in `client/types/post.ts`: `PostType`, `PostCategory`, `PostStatus`, `ContactPreference`
- Server types inferred from Drizzle schema: `Post`, `User`, `Report`

## Development Commands

```bash
# Start Expo dev client (mobile/web)
npm run expo:dev

# Start Express server (development)
npm run server:dev

# Push database schema changes
npm run db:push

# Type checking
npm run check:types

# Lint and format
npm run lint:fix
npm run format
```

## Database
- PostgreSQL with Drizzle ORM
- Schema in `shared/schema.ts`, config in `drizzle.config.ts`
- Requires `DATABASE_URL` environment variable
- Use `drizzle-kit push` for schema migrations (not migration files)

## Design Guidelines
Refer to `design_guidelines.md` for:
- Brand identity ("Warm Minimalism" aesthetic)
- Screen-by-screen component specifications
- Safe area and layout requirements
- Color usage (green primary #2D8659, urgent orange #D84315, anonymous purple #5E35B1)
