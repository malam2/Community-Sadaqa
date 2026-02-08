import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { Post, getCategoryLabel, getTimeAgo } from "@/types/post";

interface PostCardProps {
  post: Post;
  onPress: () => void;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PostCard({ post, onPress, testID }: PostCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.badges}>
          <Badge variant={post.type} />
          {post.urgent ? (
            <View style={styles.badgeGap}>
              <Badge variant="urgent" small />
            </View>
          ) : null}
          {post.status === "fulfilled" ? (
            <View style={styles.badgeGap}>
              <Badge variant="fulfilled" small />
            </View>
          ) : null}
        </View>
        <View style={styles.categoryContainer}>
          <Feather
            name={getCategoryIcon(post.category)}
            size={14}
            color={theme.textSecondary}
          />
          <ThemedText style={[styles.category, { color: theme.textSecondary }]}>
            {getCategoryLabel(post.category)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h3" style={styles.title} numberOfLines={2}>
        {post.title}
      </ThemedText>

      <ThemedText
        type="small"
        style={[styles.description, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {post.description}
      </ThemedText>

      <View style={styles.footer}>
        <View style={styles.authorInfo}>
          {post.isAnonymous ? (
            <Badge variant="anonymous" small />
          ) : (
            <ThemedText style={[styles.author, { color: theme.textTertiary }]}>
              {post.authorDisplayName || "Community Member"}
            </ThemedText>
          )}
        </View>
        <ThemedText style={[styles.time, { color: theme.textTertiary }]}>
          {getTimeAgo(post.createdAt)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function getCategoryIcon(category: string): keyof typeof Feather.glyphMap {
  switch (category) {
    case "food":
      return "coffee";
    case "baby_supplies":
      return "heart";
    case "ride":
      return "navigation";
    case "essentials":
      return "shopping-bag";
    case "consulting":
      return "message-circle";
    case "shelter":
      return "home";
    default:
      return "more-horizontal";
  }
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeGap: {
    marginLeft: Spacing.xs,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    marginLeft: 4,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    fontSize: 12,
  },
  time: {
    fontSize: 12,
  },
});
