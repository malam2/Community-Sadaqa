import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Quote {
  text: string;
  source: string;
  arabic?: string;
  type: "quran" | "hadith" | "wisdom";
}

const ISLAMIC_QUOTES: Quote[] = [
  {
    text: "The believer's shade on the Day of Resurrection will be their charity.",
    source: "Prophet Muhammad ﷺ (Tirmidhi)",
    type: "hadith",
  },
  {
    text: "And whatever good you put forward for yourselves - you will find it with Allah. It is better and greater in reward.",
    arabic:
      "وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ",
    source: "Quran 73:20",
    type: "quran",
  },
  {
    text: "The best of people are those who are most beneficial to people.",
    source: "Prophet Muhammad ﷺ (Daraqutni)",
    type: "hadith",
  },
  {
    text: "Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?",
    arabic:
      "مَّن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً",
    source: "Quran 2:245",
    type: "quran",
  },
  {
    text: "Every act of kindness is charity.",
    source: "Prophet Muhammad ﷺ (Bukhari & Muslim)",
    type: "hadith",
  },
  {
    text: "Those who spend their wealth in the way of Allah and then do not follow up what they have spent with reminders or injury will have their reward with their Lord.",
    arabic:
      "الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ ثُمَّ لَا يُتْبِعُونَ مَا أَنفَقُوا مَنًّا وَلَا أَذًى",
    source: "Quran 2:262",
    type: "quran",
  },
  {
    text: "Give charity without delay, for it stands in the way of calamity.",
    source: "Prophet Muhammad ﷺ (Tirmidhi)",
    type: "hadith",
  },
  {
    text: "A kind word and forgiveness are better than charity followed by injury.",
    arabic:
      "قَوْلٌ مَّعْرُوفٌ وَمَغْفِرَةٌ خَيْرٌ مِّن صَدَقَةٍ يَتْبَعُهَا أَذًى",
    source: "Quran 2:263",
    type: "quran",
  },
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Prophet Muhammad ﷺ (Bukhari & Muslim)",
    type: "hadith",
  },
  {
    text: "And cooperate in righteousness and piety, but do not cooperate in sin and aggression.",
    arabic:
      "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ",
    source: "Quran 5:2",
    type: "quran",
  },
  {
    text: "Whoever relieves a believer's distress in this world, Allah will relieve their distress on the Day of Resurrection.",
    source: "Prophet Muhammad ﷺ (Muslim)",
    type: "hadith",
  },
  {
    text: "Smiling at your brother is an act of charity.",
    source: "Prophet Muhammad ﷺ (Tirmidhi)",
    type: "hadith",
  },
];

interface IslamicQuoteProps {
  variant?: "card" | "inline" | "banner";
  showRefresh?: boolean;
  quoteIndex?: number;
}

export function IslamicQuote({
  variant = "card",
  showRefresh = true,
  quoteIndex,
}: IslamicQuoteProps) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = React.useState(
    quoteIndex ?? Math.floor(Math.random() * ISLAMIC_QUOTES.length),
  );

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const currentQuote = ISLAMIC_QUOTES[currentIndex];

  const refreshQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    opacity.value = withTiming(0, { duration: 150 }, () => {
      opacity.value = withTiming(1, { duration: 150 });
    });

    setTimeout(() => {
      let newIndex = Math.floor(Math.random() * ISLAMIC_QUOTES.length);
      while (newIndex === currentIndex && ISLAMIC_QUOTES.length > 1) {
        newIndex = Math.floor(Math.random() * ISLAMIC_QUOTES.length);
      }
      setCurrentIndex(newIndex);
    }, 150);
  };

  const getQuoteTypeColor = () => {
    switch (currentQuote.type) {
      case "quran":
        return isDark ? "#34D399" : "#059669";
      case "hadith":
        return isDark ? "#FBBF24" : "#D97706";
      default:
        return isDark ? "#A78BFA" : "#7C3AED";
    }
  };

  const getQuoteTypeLabel = () => {
    switch (currentQuote.type) {
      case "quran":
        return "📖 Quran";
      case "hadith":
        return "🕌 Hadith";
      default:
        return "✨ Wisdom";
    }
  };

  if (variant === "inline") {
    return (
      <View
        style={[
          styles.inlineContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <Feather
          name="bookmark"
          size={14}
          color={theme.textTertiary}
          style={styles.inlineIcon}
        />
        <ThemedText
          type="small"
          style={[styles.inlineText, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          "{currentQuote.text}"
        </ThemedText>
      </View>
    );
  }

  if (variant === "banner") {
    return (
      <Animated.View entering={FadeIn.duration(500)}>
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFBEB",
              borderColor: isDark ? "#334155" : "#FDE68A",
            },
          ]}
        >
          <Feather
            name="star"
            size={16}
            color={isDark ? "#FBBF24" : "#D97706"}
          />
          <ThemedText
            type="small"
            style={[
              styles.bannerText,
              { color: isDark ? "#FDE68A" : "#92400E" },
            ]}
            numberOfLines={2}
          >
            {currentQuote.text}
          </ThemedText>
        </View>
      </Animated.View>
    );
  }

  // Default card variant
  return (
    <Animated.View entering={FadeIn.duration(400)} style={animatedStyle}>
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.quoteTypeContainer}>
            <ThemedText
              type="small"
              style={[styles.quoteType, { color: getQuoteTypeColor() }]}
            >
              {getQuoteTypeLabel()}
            </ThemedText>
          </View>
          {showRefresh && (
            <Pressable
              onPress={refreshQuote}
              hitSlop={10}
              style={styles.refreshButton}
            >
              <Feather name="refresh-cw" size={16} color={theme.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Arabic Text (if available) */}
        {currentQuote.arabic && (
          <ThemedText
            style={[
              styles.arabicText,
              { color: isDark ? "#A7F3D0" : "#047857" },
            ]}
          >
            {currentQuote.arabic}
          </ThemedText>
        )}

        {/* Quote Icon */}
        <View style={styles.quoteIconContainer}>
          <Feather
            name="message-circle"
            size={20}
            color={theme.textTertiary}
            style={{ opacity: 0.5 }}
          />
        </View>

        {/* Quote Text */}
        <ThemedText style={[styles.quoteText, { color: theme.text }]}>
          "{currentQuote.text}"
        </ThemedText>

        {/* Source */}
        <View style={styles.sourceContainer}>
          <View
            style={[
              styles.sourceDivider,
              { backgroundColor: getQuoteTypeColor() },
            ]}
          />
          <ThemedText
            type="small"
            style={[styles.sourceText, { color: theme.textSecondary }]}
          >
            — {currentQuote.source}
          </ThemedText>
        </View>

        {/* Decorative Corner */}
        <View
          style={[
            styles.decorativeCorner,
            { borderColor: getQuoteTypeColor() },
          ]}
        />
      </View>
    </Animated.View>
  );
}

// Export quotes for use elsewhere
export { ISLAMIC_QUOTES };

const styles = StyleSheet.create({
  // Card variant
  cardContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  quoteTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quoteType: {
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: Spacing.xs,
  },
  arabicText: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "right",
    fontWeight: "500",
    marginBottom: Spacing.md,
    fontFamily: "System",
  },
  quoteIconContainer: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    opacity: 0.3,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: Spacing.md,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceDivider: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginRight: Spacing.sm,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  decorativeCorner: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: BorderRadius.sm,
    opacity: 0.3,
  },

  // Inline variant
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
  },
  inlineIcon: {
    marginRight: Spacing.sm,
  },
  inlineText: {
    flex: 1,
    fontStyle: "italic",
    fontSize: 12,
  },

  // Banner variant
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  bannerText: {
    flex: 1,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 18,
  },
});
