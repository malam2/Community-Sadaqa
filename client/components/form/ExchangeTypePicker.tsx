import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/primitives/ThemedText";
import { FormInput } from "@/components/form/FormInput";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { ExchangeType, EXCHANGE_TYPES } from "@/types/post";

interface ExchangeTypePickerProps {
  value: ExchangeType | null;
  onChange: (type: ExchangeType) => void;
  exchangeNotes?: string;
  onNotesChange?: (notes: string) => void;
  postType?: "request" | "offer";
  error?: string;
}

export function ExchangeTypePicker({
  value,
  onChange,
  exchangeNotes,
  onNotesChange,
  postType = "request",
  error,
}: ExchangeTypePickerProps) {
  const { theme } = useTheme();

  const handleSelect = (type: ExchangeType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(type);
  };

  // Filter options based on post type
  const options = EXCHANGE_TYPES.filter((opt) => {
    // For offers, don't show "money" as primary option
    if (postType === "offer" && opt.value === "money") {
      return false;
    }
    return true;
  });

  const showMoneyWarning = value === "money" || value === "either";

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: theme.textSecondary }]}
      >
        {postType === "request" ? "What type of help do you need?" : "What are you offering?"}
      </ThemedText>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? theme.primary + "15"
                    : theme.backgroundSecondary,
                  borderColor: isSelected ? theme.primary : "transparent",
                },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      isSelected && { color: theme.primary },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {isSelected && (
                    <Feather name="check" size={18} color={theme.primary} />
                  )}
                </View>
                <ThemedText
                  type="small"
                  style={[styles.optionDescription, { color: theme.textSecondary }]}
                >
                  {option.description}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Money warning & guidance */}
      {showMoneyWarning && (
        <View
          style={[
            styles.warningBox,
            { backgroundColor: theme.accent + "20", borderColor: theme.accent },
          ]}
        >
          <Feather name="alert-triangle" size={18} color="#B8860B" />
          <View style={styles.warningContent}>
            <ThemedText style={[styles.warningTitle, { color: "#B8860B" }]}>
              Safety Guidance
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.warningText, { color: theme.textSecondary }]}
            >
              {postType === "request"
                ? "For your safety, we encourage receiving essential goods rather than cash when possible. If financial help is truly needed, please explain your situation below."
                : "For everyone's safety, we encourage offering essential goods rather than cash when possible."}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Notes field for money requests */}
      {showMoneyWarning && postType === "request" && onNotesChange && (
        <FormInput
          label="Please explain why financial assistance is needed"
          value={exchangeNotes ?? ""}
          onChangeText={onNotesChange}
          placeholder="e.g., Medical bills, utility payment, specific purchase..."
          multiline
        />
      )}

      {/* Guidance box for goods */}
      {value === "goods" && (
        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.primary + "10", borderColor: theme.primary },
          ]}
        >
          <Feather name="check-circle" size={18} color={theme.primary} />
          <ThemedText
            type="small"
            style={[styles.infoText, { color: theme.textSecondary }]}
          >
            Exchanging essential goods helps ensure safety for all parties and
            builds trust in our community.
          </ThemedText>
        </View>
      )}

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
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  option: {
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    padding: Spacing.md,
  },
  optionContent: {
    gap: Spacing.xs,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
  optionDescription: {
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  warningContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  warningTitle: {
    fontWeight: "600",
    fontSize: 14,
  },
  warningText: {
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});
