import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { showAlert } from "@/lib/alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
  KeyboardAwareScrollViewCompat,
  SegmentedControl,
  FormInput,
  Dropdown,
  Toggle,
  Button,
  ThemedText,
  EmptyState,
  IslamicQuote,
  LocationPicker,
  ExchangeTypePicker,
} from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  PostType,
  PostCategory,
  ContactPreference,
  ExchangeType,
  CATEGORIES,
  CONTACT_PREFERENCES,
} from "@/types/post";
import { UserLocation } from "@/types/location";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "request", label: "Request Help" },
  { value: "offer", label: "Offer Help" },
];

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isGuest, logout, user } = useAuth();

  const [type, setType] = React.useState<PostType>("request");
  const [category, setCategory] = React.useState<PostCategory | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isUrgent, setIsUrgent] = React.useState(false);
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [contactPreference, setContactPreference] =
    React.useState<ContactPreference | null>("in_app");
  const [contactPhone, setContactPhone] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = React.useState(false);
  
  // New: Location and exchange type
  const [location, setLocation] = React.useState<UserLocation>({
    city: user?.city,
    state: user?.state,
    zipCode: user?.zipCode,
    latitude: user?.latitude,
    longitude: user?.longitude,
  });
  const [exchangeType, setExchangeType] = React.useState<ExchangeType | null>("goods");
  const [exchangeNotes, setExchangeNotes] = React.useState("");

  const needsPhone =
    contactPreference === "phone" || contactPreference === "any";
  const needsEmail =
    contactPreference === "email" || contactPreference === "any";

  const isFormValid =
    category !== null &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    contactPreference !== null &&
    exchangeType !== null &&
    disclaimerAccepted &&
    (!needsPhone || contactPhone.trim().length >= 10) &&
    (!needsEmail || contactEmail.trim().includes("@"));

  const handleNext = () => {
    if (!isFormValid) {
      showAlert("Incomplete Form", "Please fill in all required fields.");
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
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        // Location fields
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        latitude: location.latitude,
        longitude: location.longitude,
        // Exchange type
        exchangeType: exchangeType!,
        exchangeNotes: exchangeNotes.trim() || undefined,
      },
    });
  };

  // Show signup prompt for guests
  if (isGuest) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View
          style={[
            styles.guestContainer,
            { paddingTop: headerHeight + Spacing.xl },
          ]}
        >
          <EmptyState
            title="Create an Account"
            description="Sign up to create posts and help your community. It only takes a minute!"
            actionLabel="Sign Up"
            onAction={() => {
              logout(); // Clear guest session to show auth screen
            }}
          />
        </View>
      </View>
    );
  }

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

        {/* Encouraging Message */}
        <IslamicQuote variant="banner" />

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
              style={[styles.warning, { backgroundColor: theme.accent + "20" }]}
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

          {needsPhone && (
            <FormInput
              label="Phone Number"
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              testID="input-phone"
            />
          )}

          {needsEmail && (
            <FormInput
              label="Email Address"
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="input-email"
            />
          )}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Location
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.sectionDescription, { color: theme.textSecondary }]}
          >
            Help connect with people near you
          </ThemedText>
          <LocationPicker
            value={location}
            onChange={setLocation}
            label="Post Location"
          />
        </View>

        {/* Exchange Type Section */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Type of Help
          </ThemedText>
          <ExchangeTypePicker
            value={exchangeType}
            onChange={setExchangeType}
            exchangeNotes={exchangeNotes}
            onNotesChange={setExchangeNotes}
            postType={type}
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
              I confirm this post follows 1 Sadaqa community guidelines and
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
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    marginBottom: Spacing.md,
    lineHeight: 18,
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
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
});
