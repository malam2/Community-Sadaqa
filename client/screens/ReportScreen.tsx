import React from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Report } from "@/types/post";
import { saveReport, getUser } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type ReportRouteProp = RouteProp<RootStackParamList, "Report">;

type ReportReason = Report["reason"];

const REPORT_REASONS: { value: ReportReason; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: "scam", label: "Scam or Fraud", icon: "alert-triangle" },
  { value: "illegal", label: "Illegal Content", icon: "shield-off" },
  { value: "harassment", label: "Harassment", icon: "user-x" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReportRouteProp>();

  const { postId } = route.params;
  const [selectedReason, setSelectedReason] = React.useState<ReportReason | null>(null);
  const [details, setDetails] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Select a Reason", "Please select a reason for your report.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await getUser();
      if (!user) {
        Alert.alert("Error", "Please try again.");
        return;
      }

      await saveReport({
        postId,
        reporterId: user.id,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Report Submitted",
        "Thank you for helping keep our community safe. We will review this report.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h3" style={styles.title}>
          Report this post
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Help us keep the community safe. Select a reason for your report.
        </ThemedText>

        <View style={styles.reasonsContainer}>
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason.value}
              style={[
                styles.reasonCard,
                {
                  backgroundColor:
                    selectedReason === reason.value
                      ? theme.primary + "15"
                      : theme.backgroundSecondary,
                  borderColor:
                    selectedReason === reason.value
                      ? theme.primary
                      : "transparent",
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedReason(reason.value);
              }}
            >
              <View
                style={[
                  styles.reasonIcon,
                  {
                    backgroundColor:
                      selectedReason === reason.value
                        ? theme.primary
                        : theme.backgroundTertiary,
                  },
                ]}
              >
                <Feather
                  name={reason.icon}
                  size={18}
                  color={
                    selectedReason === reason.value
                      ? "#FFFFFF"
                      : theme.textSecondary
                  }
                />
              </View>
              <ThemedText
                style={[
                  styles.reasonLabel,
                  {
                    color:
                      selectedReason === reason.value
                        ? theme.primary
                        : theme.text,
                    fontWeight: selectedReason === reason.value ? "600" : "400",
                  },
                ]}
              >
                {reason.label}
              </ThemedText>
              {selectedReason === reason.value ? (
                <Feather name="check-circle" size={20} color={theme.primary} />
              ) : null}
            </Pressable>
          ))}
        </View>

        {selectedReason === "other" ? (
          <FormInput
            label="Additional Details"
            value={details}
            onChangeText={setDetails}
            placeholder="Please provide more information..."
            multiline
            maxLength={500}
            testID="input-report-details"
          />
        ) : null}

        <Button
          onPress={handleSubmit}
          disabled={!selectedReason || isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            "Submit Report"
          )}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
  },
  reasonsContainer: {
    marginBottom: Spacing["2xl"],
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  reasonLabel: {
    flex: 1,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
