import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { IslamicQuote, ISLAMIC_QUOTES } from "@/components/IslamicQuote";
import { Button } from "@/components/Button";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AboutScreenProps {
  onClose?: () => void;
}

export default function AboutScreen({ onClose }: AboutScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const principles = [
    {
      icon: "heart" as const,
      title: "Easy to Give",
      description:
        "Found someone who wants to help but couldn't find a way? Now they can. One tap connects givers with receivers.",
    },
    {
      icon: "unlock" as const,
      title: "Safe to Ask",
      description:
        "Asking for help takes courage. Here, it's honored. Post anonymously if you prefer — your dignity always comes first.",
    },
    {
      icon: "users" as const,
      title: "Know Your Neighbors",
      description:
        "Every interaction builds trust. Over time, strangers become neighbors, neighbors become family.",
    },
    {
      icon: "shield" as const,
      title: "Stand Together",
      description:
        "A community that knows each other can withstand anything. That's the ummah we're building.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Share Your Need or Offer",
      description: "Whether you need a ride, have extra food, or can offer your time — post it here.",
    },
    {
      step: "2",
      title: "Connect Directly",
      description: "No bureaucracy. Real people helping real people. Browse and reach out.",
    },
    {
      step: "3",
      title: "Build Lasting Bonds",
      description: "Every exchange strengthens our community. Today's stranger is tomorrow's friend.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={
              isDark
                ? ["#064E3B", "#065F46", "#047857"]
                : ["#ECFDF5", "#D1FAE5", "#A7F3D0"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroIcon}>
              <Feather
                name="heart"
                size={40}
                color={isDark ? "#34D399" : "#059669"}
              />
            </View>
            <ThemedText
              type="h1"
              style={[styles.heroTitle, { color: isDark ? "#F0FDF4" : "#064E3B" }]}
            >
              One Ummah
            </ThemedText>
            <ThemedText
              style={[styles.heroSubtitle, { color: isDark ? "#A7F3D0" : "#047857" }]}
            >
              In These Days, We Have Each Other
            </ThemedText>
            <ThemedText
              style={[styles.heroDescription, { color: isDark ? "#D1FAE5" : "#065F46" }]}
            >
              A non-profit platform where those eager to help find those in need, and those in need find the courage to ask. Together, we're building a community that can stand up to anything.
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        {/* Mission Quote */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.missionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText type="h3" style={[styles.sectionTitle, { color: theme.text }]}>
              Why One Ummah? 🎯
            </ThemedText>
            <ThemedText style={[styles.missionText, { color: theme.textSecondary }]}>
              Many people are eager to help but can't find a centralized way to do so. At the same time, many need help but find it hard to ask directly. One Ummah bridges that gap — creating a space where giving is celebrated and asking is honored.{"\n\n"}Our ultimate vision: A strong community where members know each other, support each other, and can rise together through any challenge.
            </ThemedText>
          </View>
        </Animated.View>

        {/* Islamic Wisdom */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <ThemedText type="h3" style={[styles.sectionTitle, { color: theme.text, marginBottom: Spacing.md }]}>
            Islamic Wisdom 📖
          </ThemedText>
          <IslamicQuote variant="card" showRefresh />
        </Animated.View>

        {/* Core Principles */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <ThemedText type="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Our Principles 💚
          </ThemedText>
          <View style={styles.principlesGrid}>
            {principles.map((principle, index) => (
              <View
                key={principle.title}
                style={[
                  styles.principleCard,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.principleIcon,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <Feather name={principle.icon} size={20} color={theme.primary} />
                </View>
                <ThemedText type="h4" style={[styles.principleTitle, { color: theme.text }]}>
                  {principle.title}
                </ThemedText>
                <ThemedText style={[styles.principleDescription, { color: theme.textSecondary }]}>
                  {principle.description}
                </ThemedText>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* How It Works */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <ThemedText type="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            How It Works 🤝
          </ThemedText>
          {howItWorks.map((item, index) => (
            <View
              key={item.step}
              style={[
                styles.stepCard,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.stepNumber,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText style={styles.stepNumberText}>{item.step}</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="h4" style={[styles.stepTitle, { color: theme.text }]}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* More Quotes */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <ThemedText type="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Words of Inspiration ✨
          </ThemedText>
          <View style={styles.quotesGrid}>
            {ISLAMIC_QUOTES.slice(0, 4).map((quote, index) => (
              <View
                key={index}
                style={[
                  styles.miniQuoteCard,
                  {
                    backgroundColor: index % 2 === 0
                      ? (isDark ? "#064E3B" : "#ECFDF5")
                      : (isDark ? "#1E293B" : "#FFFBEB"),
                    borderColor: index % 2 === 0
                      ? (isDark ? "#10B981" : "#A7F3D0")
                      : (isDark ? "#FBBF24" : "#FDE68A"),
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.miniQuoteText,
                    { color: index % 2 === 0 ? theme.primary : (isDark ? "#FBBF24" : "#D97706") },
                  ]}
                  numberOfLines={3}
                >
                  "{quote.text}"
                </ThemedText>
                <ThemedText style={[styles.miniQuoteSource, { color: theme.textTertiary }]}>
                  — {quote.source}
                </ThemedText>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <View style={[styles.footer, { borderColor: theme.border }]}>
            <ThemedText style={[styles.footerText, { color: theme.textTertiary }]}>
              One Ummah • A Non-Profit Initiative 💚
            </ThemedText>
            <ThemedText style={[styles.footerVerse, { color: theme.textSecondary }]}>
              "The believers are like one body. When one part suffers, the whole body responds."
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.md,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
  missionCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  missionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  principlesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  principleCard: {
    width: "48%",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  principleIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  principleTitle: {
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  principleDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  quotesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  miniQuoteCard: {
    width: "48%",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
  },
  miniQuoteText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
    marginBottom: Spacing.xs,
  },
  miniQuoteSource: {
    fontSize: 10,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  footerVerse: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
});
