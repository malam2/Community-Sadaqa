import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInRight } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface QuickAction {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  color: string;
  lightBg: string;
  darkBg: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "request",
    icon: "message-circle",
    label: "Need Help?",
    description: "Post a request",
    color: "#0D9488",
    lightBg: "#F0FDFA",
    darkBg: "#042F2E",
  },
  {
    id: "offer",
    icon: "gift",
    label: "Want to Help?",
    description: "Offer your support",
    color: "#D97706",
    lightBg: "#FFFBEB",
    darkBg: "#451A03",
  },
  {
    id: "urgent",
    icon: "zap",
    label: "Urgent Need?",
    description: "Mark as priority",
    color: "#DC2626",
    lightBg: "#FEF2F2",
    darkBg: "#450A0A",
  },
];

interface QuickActionsProps {
  onActionPress?: (actionId: string) => void;
}

export function QuickActions({ onActionPress }: QuickActionsProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        How can we help today?
      </ThemedText>
      <View style={styles.actionsContainer}>
        {QUICK_ACTIONS.map((action, index) => (
          <Animated.View
            key={action.id}
            entering={FadeInRight.delay(index * 100).duration(300)}
            style={styles.actionWrapper}
          >
            <Pressable
              onPress={() => onActionPress?.(action.id)}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  backgroundColor: isDark ? action.darkBg : action.lightBg,
                  borderColor: action.color,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${action.color}20` },
                ]}
              >
                <Feather name={action.icon} size={20} color={action.color} />
              </View>
              <ThemedText
                type="small"
                style={[styles.actionLabel, { color: action.color }]}
              >
                {action.label}
              </ThemedText>
              <ThemedText
                type="small"
                style={[
                  styles.actionDescription,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                {action.description}
              </ThemedText>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

interface CommunityStatsProps {
  stats?: {
    totalPosts: number;
    activeRequests: number;
    fulfilledToday: number;
    communityMembers: number;
  };
}

export function CommunityStats({ stats }: CommunityStatsProps) {
  const { theme, isDark } = useTheme();

  // Default demo stats if none provided
  const displayStats = stats || {
    totalPosts: 0,
    activeRequests: 0,
    fulfilledToday: 0,
    communityMembers: 0,
  };

  const statItems = [
    {
      value: displayStats.activeRequests,
      label: "Active Requests",
      icon: "inbox" as const,
      color: "#0D9488",
    },
    {
      value: displayStats.fulfilledToday,
      label: "Helped Today",
      icon: "check-circle" as const,
      color: "#D97706",
    },
    {
      value: displayStats.communityMembers,
      label: "Members",
      icon: "users" as const,
      color: "#7C3AED",
    },
  ];

  if (displayStats.totalPosts === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.statsContainer,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.statsHeader}>
        <Feather name="bar-chart-2" size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.statsTitle, { color: theme.textSecondary }]}
        >
          Community Impact
        </ThemedText>
      </View>
      <View style={styles.statsRow}>
        {statItems.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: `${stat.color}15` },
              ]}
            >
              <Feather name={stat.icon} size={14} color={stat.color} />
            </View>
            <ThemedText
              type="h4"
              style={[styles.statValue, { color: theme.text }]}
            >
              {stat.value}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.statLabel, { color: theme.textTertiary }]}
            >
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

interface EncouragementBadgeProps {
  message?: string;
}

const ENCOURAGEMENT_MESSAGES = [
  "Every act of kindness, no matter how small, makes a difference.",
  "Together, we can uplift our community.",
  "Your generosity inspires others to give.",
  "Be the change you wish to see in your community.",
  "Small steps lead to great journeys of kindness.",
  "The community is one body; when one part suffers, all feel it.",
];

export function EncouragementBadge({ message }: EncouragementBadgeProps) {
  const { theme, isDark } = useTheme();
  const randomMessage =
    message ||
    ENCOURAGEMENT_MESSAGES[
      Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)
    ];

  return (
    <View
      style={[
        styles.encouragementContainer,
        {
          backgroundColor: isDark ? "#1E293B" : "#F0FDFA",
          borderColor: isDark ? "#334155" : "#99F6E4",
        },
      ]}
    >
      <ThemedText
        type="small"
        style={[
          styles.encouragementText,
          { color: isDark ? "#5EEAD4" : "#0F766E" },
        ]}
      >
        {randomMessage}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  // Quick Actions
  container: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 11,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionWrapper: {
    flex: 1,
  },
  actionCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 10,
    textAlign: "center",
  },

  // Community Stats
  statsContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  statsTitle: {
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statIconBg: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    textAlign: "center",
  },

  // Encouragement Badge
  encouragementContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  encouragementText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
