/**
 * Barrel export for all components
 * Import from "@/components" or "@/components/[category]"
 */

// UI Components
export { Badge } from "./ui/Badge";
export { Button } from "./ui/Button";
export { FilterChip } from "./ui/FilterChip";

// Form Components
export { FormInput } from "./form/FormInput";
export { Dropdown } from "./form/Dropdown";
export { Toggle } from "./form/Toggle";
export { SegmentedControl } from "./form/SegmentedControl";
export { LocationPicker } from "./form/LocationPicker";
export { ExchangeTypePicker } from "./form/ExchangeTypePicker";

// Primitives
export { ThemedText } from "./primitives/ThemedText";
export { ThemedView } from "./primitives/ThemedView";
export { default as Spacer } from "./primitives/Spacer";

// Feedback Components
export { ToastProvider, toast } from "./feedback/Toast";
export {
  Skeleton,
  SkeletonFeed,
  SkeletonProfileHeader,
} from "./feedback/Skeleton";
export { EmptyState } from "./feedback/EmptyState";
export { ErrorBoundary } from "./feedback/ErrorBoundary";
export {
  ErrorFallback,
  type ErrorFallbackProps,
} from "./feedback/ErrorFallback";

// Posts
export { PostCard } from "./posts/PostCard";

// Layout
export { KeyboardAwareScrollViewCompat } from "./layout/KeyboardAwareScrollViewCompat";

// Widgets
export { WelcomeBanner } from "./widgets/WelcomeBanner";
export { IslamicQuote, ISLAMIC_QUOTES } from "./widgets/IslamicQuote";
export { QuickActions, EncouragementBadge } from "./widgets/CommunityWidgets";

// Navigation
export { HeaderTitle } from "./navigation/HeaderTitle";
