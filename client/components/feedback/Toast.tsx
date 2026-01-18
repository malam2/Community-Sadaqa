import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Toast, { ToastConfig } from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/primitives/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

/**
 * Custom toast configuration matching app theme
 */
export function useToastConfig(): ToastConfig {
  const { theme } = useTheme();

  return {
    success: (props) => (
      <View
        style={[
          styles.toast,
          styles.successToast,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.primary,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            type="body"
            style={{ color: theme.text, fontWeight: "600" }}
          >
            {props.text1}
          </ThemedText>
          {props.text2 && (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {props.text2}
            </ThemedText>
          )}
        </View>
      </View>
    ),

    error: (props) => (
      <View
        style={[
          styles.toast,
          styles.errorToast,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.urgent,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: theme.urgentLight }]}
        >
          <Ionicons name="alert-circle" size={20} color={theme.urgent} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            type="body"
            style={{ color: theme.text, fontWeight: "600" }}
          >
            {props.text1}
          </ThemedText>
          {props.text2 && (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {props.text2}
            </ThemedText>
          )}
        </View>
      </View>
    ),

    info: (props) => (
      <View
        style={[
          styles.toast,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            type="body"
            style={{ color: theme.text, fontWeight: "600" }}
          >
            {props.text1}
          </ThemedText>
          {props.text2 && (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {props.text2}
            </ThemedText>
          )}
        </View>
      </View>
    ),
  };
}

/**
 * Toast provider component - add this to App.tsx
 */
export function ToastProvider() {
  const config = useToastConfig();
  const insets = useSafeAreaInsets();

  return (
    <Toast
      config={config}
      position="top"
      topOffset={insets.top + Spacing.md}
      visibilityTime={3000}
    />
  );
}

// Toast helper functions for easy usage
export const toast = {
  success: (message: string, description?: string) => {
    Toast.show({
      type: "success",
      text1: message,
      text2: description,
    });
  },

  error: (message: string, description?: string) => {
    Toast.show({
      type: "error",
      text1: message,
      text2: description,
    });
  },

  info: (message: string, description?: string) => {
    Toast.show({
      type: "info",
      text1: message,
      text2: description,
    });
  },

  hide: () => {
    Toast.hide();
  },
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  successToast: {
    borderLeftWidth: 4,
  },
  errorToast: {
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
