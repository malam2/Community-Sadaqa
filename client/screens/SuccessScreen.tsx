import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInUp, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { IslamicQuote } from "@/components/IslamicQuote";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type SuccessRouteProp = RouteProp<RootStackParamList, "Success">;

export default function SuccessScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<SuccessRouteProp>();

  const { type } = route.params;
  const isRequest = type === "request";

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Main" }],
      }),
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.delay(100).duration(500)}>
          <Image
            source={require("../../assets/images/success-checkmark.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.textContainer}
        >
          <ThemedText type="h1" style={styles.title}>
            {isRequest ? "Request Posted!" : "Offer Posted!"}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.description, { color: theme.textSecondary }]}
          >
            {isRequest
              ? "Your request is now live! The ummah is here for you. May Allah send help your way through those eager to give."
              : "JazakAllah khair! Your offer is now visible to those in need. You're making One Ummah stronger."}
          </ThemedText>
        </Animated.View>

        {/* Inspirational Quote */}
        <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.quoteContainer}>
          <IslamicQuote variant="inline" />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeIn.delay(600).duration(400)}
        style={styles.buttonContainer}
      >
        <Button onPress={handleDone} style={styles.button}>
          Return to Feed
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: Spacing["3xl"],
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
  },
  button: {
    width: "100%",
  },
  quoteContainer: {
    marginTop: Spacing["2xl"],
    width: "100%",
    paddingHorizontal: Spacing.lg,
  },
});
