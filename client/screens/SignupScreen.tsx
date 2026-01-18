import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import {
  KeyboardAwareScrollViewCompat,
  ThemedText,
  FormInput,
  Button,
  LocationPicker,
} from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { signup } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errorUtils";
import { Spacing } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { UserLocation } from "@/types/location";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setUser } = useAuth();

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [location, setLocation] = React.useState<UserLocation>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const isFormValid =
    displayName.trim().length >= 2 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSignup = async () => {
    if (!isFormValid) return;

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const hasLocationData = location.city || location.latitude;
      const locationData = hasLocationData
        ? {
            city: location.city,
            state: location.state,
            zipCode: location.zipCode,
            latitude: location.latitude,
            longitude: location.longitude,
            locationRadius: location.locationRadius,
          }
        : undefined;

      const user = await signup(
        email.trim(),
        password,
        displayName.trim(),
        locationData,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUser(user);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Signup Failed",
        getErrorMessage(error) || "Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ThemedText type="h1" style={styles.title}>
            Join One Ummah
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Where neighbors become family 🤝
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.quoteText, { color: theme.textTertiary }]}
          >
            Many want to help but can't find a way. Many need help but find it
            hard to ask. We bridge that gap.
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.form}
        >
          <FormInput
            label="Your Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="How you'll appear to others"
            autoCapitalize="words"
            autoComplete="name"
            testID="input-name"
          />

          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            testID="input-email"
          />

          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoComplete="new-password"
            testID="input-password"
          />

          <FormInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter password again"
            secureTextEntry
            autoComplete="new-password"
            error={
              confirmPassword.length > 0 && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
            testID="input-confirm-password"
          />

          <View style={styles.locationSection}>
            <ThemedText
              type="small"
              style={[styles.locationHelp, { color: theme.textSecondary }]}
            >
              📍 Your location helps show you nearby posts
            </ThemedText>
            <LocationPicker
              value={location}
              onChange={setLocation}
              showRadius
              label="Your Location (Optional)"
            />
          </View>

          <Button
            onPress={handleSignup}
            disabled={!isFormValid || isLoading}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "Create Account"
            )}
          </Button>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.footer}
        >
          <ThemedText
            type="body"
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            Already have an account?
          </ThemedText>
          <Pressable onPress={() => navigation.goBack()}>
            <ThemedText
              type="body"
              style={[styles.linkText, { color: theme.primary }]}
            >
              Sign In
            </ThemedText>
          </Pressable>
        </Animated.View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
    paddingBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.sm,
  },
  quoteText: {
    fontStyle: "italic",
    marginBottom: Spacing["2xl"],
  },
  form: {
    marginBottom: Spacing["2xl"],
  },
  locationSection: {
    marginTop: Spacing.lg,
  },
  locationHelp: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  button: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  footerText: {
    marginRight: Spacing.xs,
  },
  linkText: {
    fontWeight: "600",
  },
});
