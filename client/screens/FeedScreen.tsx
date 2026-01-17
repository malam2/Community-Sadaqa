import React from "react";
import { View, FlatList, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { FilterChip } from "@/components/FilterChip";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { Post, PostType, PostCategory, CATEGORIES } from "@/types/post";
import { fetchPosts } from "@/lib/api";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type FilterType = "all" | PostType | "urgent";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "request", label: "Requests" },
  { value: "offer", label: "Offers" },
  { value: "urgent", label: "Urgent" },
];

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = React.useState<PostCategory | null>(null);

  const loadPosts = React.useCallback(async () => {
    try {
      const allPosts = await fetchPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadPosts();
    });
    return unsubscribe;
  }, [navigation, loadPosts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPosts();
  };

  const filteredPosts = React.useMemo(() => {
    let result = posts;

    if (activeFilter === "request") {
      result = result.filter((p) => p.type === "request");
    } else if (activeFilter === "offer") {
      result = result.filter((p) => p.type === "offer");
    } else if (activeFilter === "urgent") {
      result = result.filter((p) => p.urgent);
    }

    if (activeCategoryFilter) {
      result = result.filter((p) => p.category === activeCategoryFilter);
    }

    return result;
  }, [posts, activeFilter, activeCategoryFilter]);

  const handleFilterPress = (filter: FilterType) => {
    setActiveFilter(filter === activeFilter ? "all" : filter);
  };

  const handleCategoryPress = (category: PostCategory) => {
    setActiveCategoryFilter(
      category === activeCategoryFilter ? null : category
    );
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate("PostDetail", { post });
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

  const renderFilters = () => (
    <View style={styles.filtersSection}>
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
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-feed.png")}
      title="No posts yet"
      description="Be the first to help your community! Create a request or offer to get started."
      actionLabel="Create Post"
      onAction={() => navigation.navigate("CreatePost")}
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View
          style={{
            paddingTop: headerHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          }}
        >
          {renderFilters()}
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.skeleton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredPosts}
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
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersSection: {
    marginBottom: Spacing.lg,
  },
  filtersContainer: {
    paddingBottom: Spacing.sm,
  },
  categoryFiltersContainer: {
    paddingTop: Spacing.xs,
  },
  skeleton: {
    height: 140,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
});
