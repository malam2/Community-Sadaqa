import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { SegmentedControl } from "@/components/SegmentedControl";
import { FormInput } from "@/components/FormInput";
import { Dropdown } from "@/components/Dropdown";
import { Toggle } from "@/components/Toggle";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  PostType,
  PostCategory,
  ContactPreference,
  CATEGORIES,
  CONTACT_PREFERENCES,
} from "@/types/post";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "request", label: "Request Help" },
  { value: "offer", label: "Offer Help" },
];

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [type, setType] = React.useState<PostType>("request");
  const [category, setCategory] = React.useState<PostCategory | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isUrgent, setIsUrgent] = React.useState(false);
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [contactPreference, setContactPreference] =
    React.useState<ContactPreference | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = React.useState(false);

  const isFormValid =
    category !== null &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    contactPreference !== null &&
    disclaimerAccepted;

  const handleNext = () => {
    if (!isFormValid) {
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("PreviewPost", {
      postData: {
        type,
        category: category!,
        title: title.trim(),
        description: description.trim(),
        isUrgent,
        isAnonymous,
        contactPreference: contactPreference!,
      },
    });
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
        <SegmentedControl
          options={POST_TYPES}
          value={type}
          onChange={setType}
          testID="post-type-selector"
        />

        <View style={styles.section}>
          <Dropdown
            label="Category"
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
            placeholder="Select a category"
            testID="category-dropdown"
          />

          {category === "other" ? (
            <View
              style={[
                styles.warning,
                { backgroundColor: theme.accent + "20" },
              ]}
            >
              <Feather name="alert-circle" size={16} color="#B8860B" />
              <ThemedText style={[styles.warningText, { color: "#B8860B" }]}>
                Please ensure your request follows community guidelines.
              </ThemedText>
            </View>
          ) : null}

          <FormInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Brief description of your need or offer"
            maxLength={100}
            testID="input-title"
          />

          <FormInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Provide more details about what you need or can offer..."
            multiline
            maxLength={1000}
            testID="input-description"
          />

          <Dropdown
            label="Contact Preference"
            options={CONTACT_PREFERENCES}
            value={contactPreference}
            onChange={setContactPreference}
            placeholder="How should people reach you?"
            testID="contact-dropdown"
          />
        </View>

        <View style={styles.section}>
          <Toggle
            label="Mark as Urgent"
            description="Highlight this post for immediate attention"
            value={isUrgent}
            onChange={setIsUrgent}
            testID="toggle-urgent"
          />

          <Toggle
            label="Post Anonymously"
            description="Your name will be hidden from the community"
            value={isAnonymous}
            onChange={setIsAnonymous}
            testID="toggle-anonymous"
          />
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.disclaimerRow}
            onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: disclaimerAccepted
                    ? theme.primary
                    : "transparent",
                  borderColor: disclaimerAccepted
                    ? theme.primary
                    : theme.textTertiary,
                },
              ]}
            >
              {disclaimerAccepted ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
            <ThemedText
              type="small"
              style={[styles.disclaimerText, { color: theme.textSecondary }]}
            >
              I confirm this post follows Local Ummah community guidelines and
              does not contain any illegal, harmful, or inappropriate content.
            </ThemedText>
          </Pressable>
        </View>

        <Button
          onPress={handleNext}
          disabled={!isFormValid}
          style={styles.button}
        >
          Preview Post
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
  section: {
    marginTop: Spacing["2xl"],
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  warningText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing["2xl"],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 20,
  },
  button: {
    marginTop: Spacing.lg,
  },
});
