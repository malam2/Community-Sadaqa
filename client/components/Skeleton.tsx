import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base skeleton with shimmer animation
 */
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = BorderRadius.xs,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false,
    );
  }, [shimmerPosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerPosition.value, [-1, 1], [-200, 200]),
      },
    ],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.backgroundTertiary,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            `${theme.backgroundSecondary}80`,
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Skeleton for a text line
 */
export function SkeletonText({
  lines = 1,
  lastLineWidth = "60%",
  lineHeight = 14,
  spacing = Spacing.sm,
}: {
  lines?: number;
  lastLineWidth?: number | `${number}%`;
  lineHeight?: number;
  spacing?: number;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for an avatar/circle
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

/**
 * Skeleton for a post card (matches PostCard layout)
 */
export function SkeletonPostCard() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.postCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Badges row */}
      <View style={styles.badgesRow}>
        <Skeleton width={60} height={24} borderRadius={BorderRadius.full} />
        <Skeleton width={80} height={24} borderRadius={BorderRadius.full} />
      </View>

      {/* Title */}
      <Skeleton width="85%" height={20} style={{ marginTop: Spacing.md }} />

      {/* Description lines */}
      <View style={{ marginTop: Spacing.sm }}>
        <SkeletonText lines={2} lineHeight={14} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Skeleton width={100} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}

/**
 * Skeleton for feed screen (multiple post cards)
 */
export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.feed}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPostCard key={index} />
      ))}
    </View>
  );
}

/**
 * Skeleton for profile header
 */
export function SkeletonProfileHeader() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.profileHeader,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      <SkeletonAvatar size={64} />
      <View style={styles.profileInfo}>
        <Skeleton width={120} height={20} />
        <Skeleton width={180} height={14} style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  badgesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
  },
  feed: {
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
});
