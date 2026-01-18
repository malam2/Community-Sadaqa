import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface WelcomeBannerProps {
  onLearnMore?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function WelcomeBanner({
  onLearnMore,
  collapsed = false,
  onToggleCollapse,
}: WelcomeBannerProps) {
  const { theme, isDark } = useTheme();

  if (collapsed) {
    return (
      <Pressable onPress={onToggleCollapse}>
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            styles.collapsedContainer,
            {
              backgroundColor: isDark ? theme.primaryLight : theme.primaryLight,
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={styles.collapsedContent}>
            <View style={styles.iconContainer}>
              <Feather name="heart" size={16} color={theme.primary} />
            </View>
            <ThemedText
              style={[styles.collapsedText, { color: theme.primary }]}
            >
              Community Sadaqa — Connecting Hearts, Building Community
            </ThemedText>
            <Feather name="chevron-down" size={18} color={theme.primary} />
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <LinearGradient
        colors={
          isDark
            ? ["#064E3B", "#065F46", "#047857"]
            : ["#ECFDF5", "#D1FAE5", "#A7F3D0"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { borderColor: theme.primary }]}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Close/Collapse Button */}
        {onToggleCollapse && (
          <Pressable
            onPress={onToggleCollapse}
            style={styles.collapseButton}
            hitSlop={10}
          >
            <Feather
              name="chevron-up"
              size={20}
              color={isDark ? "#A7F3D0" : "#047857"}
            />
          </Pressable>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: isDark ? "#10B98133" : "#FFFFFF80" },
            ]}
          >
            <Feather
              name="heart"
              size={24}
              color={isDark ? "#34D399" : "#059669"}
            />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText
              type="h3"
              style={[styles.title, { color: isDark ? "#F0FDF4" : "#064E3B" }]}
            >
              Community Sadaqa
            </ThemedText>
            <ThemedText
              type="small"
              style={[
                styles.subtitle,
                { color: isDark ? "#A7F3D0" : "#047857" },
              ]}
            >
              صدقة • Charity • Mutual Aid
            </ThemedText>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.missionContainer}>
          <ThemedText
            style={[styles.mission, { color: isDark ? "#D1FAE5" : "#065F46" }]}
          >
            A mosque-centered platform connecting community members who need
            help with those who can offer it. Together, we build a stronger
            ummah through acts of kindness and generosity.
          </ThemedText>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="hand-holding-heart"
            label="Request Help"
            description="Share your needs"
            isDark={isDark}
          />
          <FeatureItem
            icon="gift"
            label="Offer Support"
            description="Give what you can"
            isDark={isDark}
          />
          <FeatureItem
            icon="users"
            label="Stay Connected"
            description="Build community"
            isDark={isDark}
          />
        </View>

        {/* Learn More Button */}
        {onLearnMore && (
          <Pressable
            onPress={onLearnMore}
            style={[
              styles.learnMoreButton,
              { backgroundColor: isDark ? "#10B981" : "#059669" },
            ]}
          >
            <ThemedText style={styles.learnMoreText}>
              Learn More About Sadaqa
            </ThemedText>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

interface FeatureItemProps {
  icon: string;
  label: string;
  description: string;
  isDark: boolean;
}

function FeatureItem({ label, description, isDark }: FeatureItemProps) {
  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    "hand-holding-heart": "heart",
    gift: "gift",
    users: "users",
  };

  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: isDark ? "#10B98140" : "#FFFFFF99" },
        ]}
      >
        <Feather
          name={iconMap[label.toLowerCase().replace(/ /g, "-")] || "star"}
          size={18}
          color={isDark ? "#34D399" : "#059669"}
        />
      </View>
      <ThemedText
        type="small"
        style={[styles.featureLabel, { color: isDark ? "#F0FDF4" : "#064E3B" }]}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="small"
        style={[
          styles.featureDescription,
          { color: isDark ? "#A7F3D0" : "#047857" },
        ]}
      >
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  collapsedContainer: {
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  collapsedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  collapsedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  collapseButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    fontWeight: "500",
  },
  missionContainer: {
    marginBottom: Spacing.lg,
  },
  mission: {
    fontSize: 14,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flex: 1,
    alignItems: "center",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  featureLabel: {
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 2,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 11,
    textAlign: "center",
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  learnMoreText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
