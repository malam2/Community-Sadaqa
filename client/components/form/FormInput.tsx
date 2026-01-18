import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";

import { ThemedText } from "@/components/primitives/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  multiline?: boolean;
}

export function FormInput({
  label,
  error,
  multiline = false,
  style,
  ...props
}: FormInputProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: theme.textSecondary }]}
      >
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            backgroundColor: theme.backgroundSecondary,
            color: theme.text,
            borderColor: error
              ? theme.urgent
              : isFocused
                ? theme.primary
                : "transparent",
          },
          style,
        ]}
        placeholderTextColor={theme.textTertiary}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error ? (
        <ThemedText style={[styles.error, { color: theme.urgent }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    borderWidth: 2,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  error: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
