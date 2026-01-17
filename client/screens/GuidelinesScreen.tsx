import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function GuidelinesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="h1" style={styles.title}>
        Community Guidelines
      </ThemedText>

      <ThemedText
        type="body"
        style={[styles.intro, { color: theme.textSecondary }]}
      >
        Welcome to IOK Sadaqa! Our community is built on trust, respect, and the
        spirit of giving (sadaqa). Please follow these guidelines to help
        maintain a safe and supportive environment.
      </ThemedText>

      <Section title="Be Respectful" theme={theme}>
        Treat all community members with kindness and respect. Remember that
        asking for help takes courage, and offering help is a blessing.
      </Section>

      <Section title="Be Honest" theme={theme}>
        Only post genuine requests and offers. Misrepresenting your situation
        harms the trust our community depends on.
      </Section>

      <Section title="Protect Privacy" theme={theme}>
        Respect the privacy of others. Do not share personal information about
        other community members without their consent.
      </Section>

      <Section title="No Illegal Activity" theme={theme}>
        Do not use this platform for any illegal purposes. All posts must comply
        with local, state, and federal laws.
      </Section>

      <Section title="Allowed Categories" theme={theme}>
        Posts should fall within our approved categories: Food, Baby Supplies,
        Rides, Essentials, Consulting/Advice, Temporary Shelter, and Other
        (appropriate requests only).
      </Section>

      <Section title="Report Concerns" theme={theme}>
        If you see content that violates these guidelines, please report it. Our
        team will review all reports and take appropriate action.
      </Section>

      <ThemedText
        type="small"
        style={[styles.footer, { color: theme.textTertiary }]}
      >
        By using IOK Sadaqa, you agree to follow these guidelines. Violations
        may result in removal of posts or account suspension.
      </ThemedText>
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  children: string;
  theme: any;
}

function Section({ title, children, theme }: SectionProps) {
  return (
    <>
      <ThemedText type="h3" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.sectionContent, { color: theme.textSecondary }]}
      >
        {children}
      </ThemedText>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  intro: {
    marginBottom: Spacing["2xl"],
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    marginBottom: Spacing["2xl"],
    lineHeight: 24,
  },
  footer: {
    marginTop: Spacing.lg,
    lineHeight: 20,
  },
});
