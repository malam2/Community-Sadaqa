import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { FilterChip } from "@/components/FilterChip";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonFeed } from "@/components/Skeleton";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { IslamicQuote } from "@/components/IslamicQuote";
import { QuickActions, EncouragementBadge } from "@/components/CommunityWidgets";
import { ThemedText } from "@/components/ThemedText";
import { Post, PostType, PostCategory, CATEGORIES } from "@/types/post";
import { usePostsQuery } from "@/hooks/queries";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const WELCOME_BANNER_KEY = "@welcome_banner_collapsed";

type FilterType = "all" | PostType | "urgent";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "request", label: "Requests" },
  { value: "offer", label: "Offers" },
  { value: "urgent", label: "Urgent" },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Welcome banner state
  const [bannerCollapsed, setBannerCollapsed] = React.useState(true);

  // Load banner state on mount
  React.useEffect(() => {
    AsyncStorage.getItem(WELCOME_BANNER_KEY).then((value) => {
      // Show banner expanded for first-time users
      setBannerCollapsed(value === "true");
    });
  }, []);

  const toggleBanner = () => {
    const newState = !bannerCollapsed;
    setBannerCollapsed(newState);
    AsyncStorage.setItem(WELCOME_BANNER_KEY, String(newState));
  };

  // Filter state
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] =
    React.useState<PostCategory | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // React Query
  const {
    data: posts = [],
    isLoading,
    isRefetching,
    refetch,
  } = usePostsQuery({
    type: activeFilter === "urgent" ? "all" : activeFilter,
    category: activeCategoryFilter ?? undefined,
    urgent: activeFilter === "urgent" ? true : undefined,
    search: debouncedSearch || undefined,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleFilterPress = (filter: FilterType) => {
    setActiveFilter(filter === activeFilter ? "all" : filter);
  };

  const handleCategoryPress = (category: PostCategory) => {
    setActiveCategoryFilter(
      category === activeCategoryFilter ? null : category,
    );
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate("PostDetail", { post });
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === "request" || actionId === "offer" || actionId === "urgent") {
      navigation.navigate("CreatePost");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <PostCard
        post={item}
        onPress={() => handlePostPress(item)}
        testID={`post-card-${item.id}`}
      />
    </Animated.View>
  );

  const renderSearchBar = () => (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <Feather name="search" size={18} color={theme.textTertiary} />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Search posts..."
        placeholderTextColor={theme.textTertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        testID="feed-search-input"
      />
      {searchQuery.length > 0 && (
        <Feather
          name="x"
          size={18}
          color={theme.textTertiary}
          onPress={clearSearch}
          testID="clear-search"
        />
      )}
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersSection}>
      {/* Welcome Banner */}
      <WelcomeBanner
        collapsed={bannerCollapsed}
        onToggleCollapse={toggleBanner}
        onLearnMore={() => navigation.navigate("About")}
      />

      {/* Islamic Quote - Inspiration */}
      {!bannerCollapsed && <IslamicQuote variant="card" showRefresh />}

      {/* Quick Actions */}
      <QuickActions onActionPress={handleQuickAction} />

      {/* Search and Filters */}
      <View style={styles.feedHeaderRow}>
        <ThemedText
          type="h4"
          style={[styles.feedSectionTitle, { color: theme.text }]}
        >
          Community Feed
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: theme.textTertiary }}
        >
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </ThemedText>
      </View>

      {renderSearchBar()}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {FILTER_OPTIONS.map((filter) => (
          <FilterChip
            key={filter.value}
            label={filter.label}
            selected={activeFilter === filter.value}
            onPress={() => handleFilterPress(filter.value)}
            testID={`filter-${filter.value}`}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFiltersContainer}
      >
        {CATEGORIES.map((category) => (
          <FilterChip
            key={category.value}
            label={category.label}
            selected={activeCategoryFilter === category.value}
            onPress={() => handleCategoryPress(category.value)}
            testID={`category-${category.value}`}
          />
        ))}
      </ScrollView>

      {/* Encouragement Message */}
      {posts.length > 0 && <EncouragementBadge />}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        image={require("../../assets/images/empty-feed.png")}
        title={searchQuery ? "No results found" : "You Could Be the First! 🌟"}
        description={
          searchQuery
            ? `No posts match "${searchQuery}". Try a different search.`
            : "Many want to help but can't find a way. Many need help but find it hard to ask.\n\nBe the one to break the ice — share a need or offer your support."
        }
        actionLabel={searchQuery ? "Clear Search" : "Start the Movement"}
        onAction={
          searchQuery ? clearSearch : () => navigation.navigate("CreatePost")
        }
      />
      {!searchQuery && (
        <View style={styles.emptyQuoteContainer}>
          <IslamicQuote variant="inline" />
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View
          style={{
            paddingTop: headerHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          }}
        >
          {renderFilters()}
          <SkeletonFeed count={3} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderFilters}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filtersSection: {
    marginBottom: Spacing.lg,
  },
  filtersContainer: {
    paddingBottom: Spacing.sm,
  },
  categoryFiltersContainer: {
    paddingTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  feedSectionTitle: {
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
  },
  emptyQuoteContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
