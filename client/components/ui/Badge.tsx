import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/primitives/ThemedText";
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
        <Image
          source={require("../../../assets/images/anonymous-indicator.png")}
          style={small ? styles.iconSmall : styles.icon}
          resizeMode="contain"
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
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 10,
    fontWeight: "600",
  },
  icon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  iconSmall: {
    width: 10,
    height: 10,
    marginRight: 2,
  },
});
