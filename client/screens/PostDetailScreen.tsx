import React from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  Post,
  getCategoryLabel,
  getTimeAgo,
  getContactPreferenceLabel,
} from "@/types/post";
import { updatePost, getUser } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PostDetailRouteProp>();

  const { post } = route.params;
  const [currentPost, setCurrentPost] = React.useState<Post>(post);
  const [isOwner, setIsOwner] = React.useState(false);

  React.useEffect(() => {
    const checkOwnership = async () => {
      const user = await getUser();
      if (user && user.id === post.authorId) {
        setIsOwner(true);
      }
    };
    checkOwnership();
  }, [post.authorId]);

  const handleOfferHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      currentPost.type === "request" ? "Offer Help" : "Accept Offer",
      `Contact preference: ${getContactPreferenceLabel(currentPost.contactPreference)}\n\nIn a future update, this will connect you directly with the poster.`,
      [{ text: "OK" }]
    );
  };

  const handleMarkFulfilled = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Mark as Fulfilled",
      "Are you sure you want to mark this post as fulfilled?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Mark Fulfilled",
          onPress: async () => {
            const updated = await updatePost(currentPost.id, {
              status: "fulfilled",
            });
            if (updated) {
              setCurrentPost(updated);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    navigation.navigate("Report", { postId: currentPost.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl + 100,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <Badge variant={currentPost.type} />
          {currentPost.urgent ? (
            <View style={styles.badgeGap}>
              <Badge variant="urgent" />
            </View>
          ) : null}
          {currentPost.status === "fulfilled" ? (
            <View style={styles.badgeGap}>
              <Badge variant="fulfilled" />
            </View>
          ) : null}
        </View>

        <ThemedText type="h1" style={styles.title}>
          {currentPost.title}
        </ThemedText>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="tag" size={14} color={theme.textTertiary} />
            <ThemedText
              style={[styles.metaText, { color: theme.textTertiary }]}
            >
              {getCategoryLabel(currentPost.category)}
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={theme.textTertiary} />
            <ThemedText
              style={[styles.metaText, { color: theme.textTertiary }]}
            >
              {getTimeAgo(currentPost.createdAt)}
            </ThemedText>
          </View>
        </View>

        {currentPost.isAnonymous ? (
          <View style={styles.anonymousSection}>
            <Badge variant="anonymous" />
            <ThemedText
              type="small"
              style={[styles.anonymousText, { color: theme.textSecondary }]}
            >
              This person has chosen to remain anonymous
            </ThemedText>
          </View>
        ) : (
          <View style={styles.authorSection}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Feather name="user" size={20} color={theme.primary} />
            </View>
            <View>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {currentPost.authorDisplayName || "Community Member"}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                IOK Diamond Bar
              </ThemedText>
            </View>
          </View>
        )}

        <View
          style={[
            styles.descriptionCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="body" style={styles.description}>
            {currentPost.description}
          </ThemedText>
        </View>

        <View style={styles.contactSection}>
          <ThemedText
            type="small"
            style={[styles.contactLabel, { color: theme.textSecondary }]}
          >
            Contact Preference
          </ThemedText>
          <View
            style={[
              styles.contactBadge,
              { backgroundColor: theme.primary + "15" },
            ]}
          >
            <Feather name="message-circle" size={16} color={theme.primary} />
            <ThemedText
              style={[styles.contactText, { color: theme.primary }]}
            >
              {getContactPreferenceLabel(currentPost.contactPreference)}
            </ThemedText>
          </View>
        </View>

        {!isOwner && currentPost.status === "open" ? (
          <Pressable
            style={[styles.reportButton]}
            onPress={handleReport}
          >
            <Feather name="flag" size={16} color={theme.textTertiary} />
            <ThemedText
              style={[styles.reportText, { color: theme.textTertiary }]}
            >
              Report this post
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>

      {currentPost.status === "open" ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.backgroundRoot,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          {isOwner ? (
            <Button onPress={handleMarkFulfilled} style={styles.actionButton}>
              Mark as Fulfilled
            </Button>
          ) : (
            <Button onPress={handleOfferHelp} style={styles.actionButton}>
              {currentPost.type === "request" ? "Offer Help" : "I Need This"}
            </Button>
          )}
        </View>
      ) : null}
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  badgeGap: {
    marginLeft: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  metaText: {
    marginLeft: Spacing.xs,
    fontSize: 13,
  },
  anonymousSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  anonymousText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
  },
  description: {
    lineHeight: 26,
  },
  contactSection: {
    marginBottom: Spacing["2xl"],
  },
  contactLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  contactBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  contactText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: Spacing.md,
  },
  reportText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  actionButton: {
    width: "100%",
  },
});
