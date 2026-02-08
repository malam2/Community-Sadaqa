import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function PrivacyScreen() {
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
        Privacy Policy
      </ThemedText>

      <ThemedText
        type="small"
        style={[styles.lastUpdated, { color: theme.textTertiary }]}
      >
        Last updated: January 2026
      </ThemedText>

      <Section title="Information We Collect" theme={theme}>
        1 Sadaqa collects minimal information necessary to provide our
        service. This includes your email address, display name, optional
        location (city, state, ZIP code), and any posts you create.
      </Section>

      <Section title="How We Use Your Information" theme={theme}>
        Your information is used to display your posts to the community,
        facilitate connections between members, and provide location-based
        features. We do not sell or share your personal information with
        third parties.
      </Section>

      <Section title="Anonymous Posting" theme={theme}>
        When you choose to post anonymously, your display name is not shown with
        your post. However, we may still associate the post with your account
        for moderation purposes.
      </Section>

      <Section title="Data Storage" theme={theme}>
        Your data is stored securely on our servers using encrypted connections.
        Your password is hashed using bcrypt and is never stored in plain text.
        You can request deletion of your account and data at any time.
      </Section>

      <Section title="Messaging" theme={theme}>
        Messages sent through the app are stored on our servers to facilitate
        conversations between community members. Message content is only
        accessible to conversation participants.
      </Section>

      <Section title="Reporting" theme={theme}>
        When you report a post, we collect the report reason and any additional
        details you provide. This information is used only for moderation
        purposes.
      </Section>

      <Section title="Your Rights" theme={theme}>
        You have the right to delete your posts and update your profile
        information at any time through the Profile section of the app. You
        can also contact us to request full account deletion.
      </Section>

      <Section title="Contact Us" theme={theme}>
        If you have any questions about this privacy policy or our practices,
        please contact the 1 Sadaqa administration.
      </Section>

      <ThemedText
        type="small"
        style={[styles.footer, { color: theme.textTertiary }]}
      >
        This privacy policy may be updated from time to time. We will notify you
        of any significant changes through the app.
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
    marginBottom: Spacing.xs,
  },
  lastUpdated: {
    marginBottom: Spacing["2xl"],
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
