import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type BadgeVariant = "request" | "offer" | "urgent" | "anonymous" | "fulfilled";

interface BadgeProps {
  variant: BadgeVariant;
  small?: boolean;
}

export function Badge({ variant, small = false }: BadgeProps) {
  const { theme } = useTheme();

  const getConfig = () => {
    switch (variant) {
      case "request":
        return {
          label: "Request",
          backgroundColor: theme.primaryLight,
          textColor: theme.primary,
        };
      case "offer":
        return {
          label: "Offer",
          backgroundColor: theme.accentLight,
          textColor: theme.accent,
        };
      case "urgent":
        return {
          label: "Urgent",
          backgroundColor: theme.urgentLight,
          textColor: theme.urgent,
        };
      case "anonymous":
        return {
          label: "Anonymous",
          backgroundColor: theme.anonymousLight,
          textColor: theme.anonymous,
          showIcon: true,
        };
      case "fulfilled":
        return {
          label: "Fulfilled",
          backgroundColor: theme.primaryLight,
          textColor: theme.success,
        };
      default:
        return {
          label: "",
          backgroundColor: theme.backgroundSecondary,
          textColor: theme.text,
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        small ? styles.badgeSmall : null,
        { backgroundColor: config.backgroundColor },
      ]}
    >
      {variant === "anonymous" ? (
        <Feather
          name="eye-off"
          size={small ? 9 : 12}
          color={config.textColor}
          style={{ marginRight: small ? 2 : 4 }}
        />
      ) : null}
      <ThemedText
        style={[
          small ? styles.textSmall : styles.text,
          { color: config.textColor },
        ]}
      >
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
