import React from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setUser } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const isFormValid = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUser(user);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Login Failed", error.message || "Please check your credentials and try again.");
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
              Local Ummah
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Community helping community
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
  },
  form: {
    marginBottom: Spacing["2xl"],
  },
  button: {
    marginTop: Spacing.lg,
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
