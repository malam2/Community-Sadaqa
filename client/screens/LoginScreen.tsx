import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import {
  KeyboardAwareScrollViewCompat,
  ThemedText,
  FormInput,
  Button,
} from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errorUtils";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setUser, continueAsGuest } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGuestLoading, setIsGuestLoading] = React.useState(false);

  const isFormValid = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUser(user);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Login Failed",
        getErrorMessage(error) ||
          "Please check your credentials and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setIsGuestLoading(true);
    try {
      await continueAsGuest();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Failed to continue as guest:", error);
    } finally {
      setIsGuestLoading(false);
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
        <View style={styles.header}>
          <Animated.View entering={FadeIn.delay(100).duration(400)}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <ThemedText type="h1" style={styles.title}>
              One Ummah
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              In these days, we have all we need — each other.
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.missionText, { color: theme.textTertiary }]}
            >
              A community where asking for help is honored, and giving is a joy.
            </ThemedText>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.form}
        >
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
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
            testID="input-password"
          />

          <Button
            onPress={handleLogin}
            disabled={!isFormValid || isLoading}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "Sign In"
            )}
          </Button>

          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.textTertiary },
              ]}
            />
            <ThemedText
              style={[styles.dividerText, { color: theme.textTertiary }]}
            >
              or
            </ThemedText>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.textTertiary },
              ]}
            />
          </View>

          <Pressable
            onPress={handleContinueAsGuest}
            disabled={isGuestLoading}
            style={[styles.guestButton, { borderColor: theme.primary }]}
          >
            {isGuestLoading ? (
              <ActivityIndicator color={theme.primary} size="small" />
            ) : (
              <ThemedText
                style={[styles.guestButtonText, { color: theme.primary }]}
              >
                Continue as Guest
              </ThemedText>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={styles.footer}
        >
          <ThemedText
            type="body"
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            Don't have an account?
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("Signup")}>
            <ThemedText
              type="body"
              style={[styles.linkText, { color: theme.primary }]}
            >
              Sign Up
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  missionText: {
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
  form: {
    marginBottom: Spacing["2xl"],
  },
  button: {
    marginTop: Spacing.lg,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 14,
  },
  guestButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  guestButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    marginRight: Spacing.xs,
  },
  linkText: {
    fontWeight: "600",
  },
});
