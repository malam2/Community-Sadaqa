import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { showAlert, showConfirmAlert, showInfoAlert } from "@/lib/alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText, Badge, Button, toast } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdatePostMutation, useDeletePostMutation } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/errorUtils";
import { startConversation } from "@/lib/api";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  Post,
  getCategoryLabel,
  getTimeAgo,
  getContactPreferenceLabel,
  getExchangeTypeLabel,
} from "@/types/post";
import { formatLocation, formatDistance } from "@/types/location";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PostDetailRouteProp>();
  const { user } = useAuth();

  const { post } = route.params;
  const [currentPost, setCurrentPost] = React.useState<Post>(post);
  const [isStartingConversation, setIsStartingConversation] = React.useState(false);
  const isOwner = user?.id === post.authorId;
  const isGuest = user?.isGuest ?? false;

  // React Query mutations
  const updateMutation = useUpdatePostMutation();
  const deleteMutation = useDeletePostMutation();

  // Start a privacy-preserving conversation
  const handleStartConversation = async () => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isGuest) {
      showConfirmAlert(
        "Sign Up Required",
        "Please create an account to message the poster.",
        () => navigation.navigate("Auth" as any),
        "Sign Up",
      );
      return;
    }

    try {
      setIsStartingConversation(true);
      const conversation = await startConversation(user.id, currentPost.id);
      
      // Navigate to conversation screen
      navigation.navigate("Conversation" as any, {
        conversationId: conversation.id,
        postTitle: currentPost.title,
      });
    } catch (error) {
      toast.error("Error", getErrorMessage(error) || "Failed to start conversation.");
    } finally {
      setIsStartingConversation(false);
    }
  };

  // Legacy direct contact (fallback)
  const handleContact = async (method: "phone" | "email" | "sms") => {
    const { contactPhone, contactEmail, title } = currentPost;

    try {
      let url = "";
      if (method === "phone" && contactPhone) {
        url = `tel:${contactPhone}`;
      } else if (method === "sms" && contactPhone) {
        const message = encodeURIComponent(
          `Hi! I'm reaching out about your post "${title}" on 1 Sadaqa.`,
        );
        url = `sms:${contactPhone}?body=${message}`;
      } else if (method === "email" && contactEmail) {
        const subject = encodeURIComponent(`Re: ${title} - 1 Sadaqa`);
        const body = encodeURIComponent(
          `Hi!\n\nI'm reaching out about your post "${title}" on 1 Sadaqa.\n\n`,
        );
        url = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      }

      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          showAlert(
            "Error",
            "Unable to open this contact method on your device.",
          );
        }
      }
    } catch (error) {
      showAlert("Error", "Failed to open contact method.");
    }
  };

  const handleOfferHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isGuest) {
      showConfirmAlert(
        "Sign Up Required",
        "Please create an account to contact the poster.",
        () => navigation.navigate("Auth" as any),
        "Sign Up",
      );
      return;
    }

    const { contactPreference, contactPhone, contactEmail } = currentPost;
    const hasPhone = !!contactPhone;
    const hasEmail = !!contactEmail;

    // For web platform, use a simpler approach
    if (Platform.OS === "web") {
      // Always start with in-app messaging on web
      handleStartConversation();
      return;
    }

    // Build contact options - prioritize in-app messaging
    const options: {
      text: string;
      onPress?: () => void;
      style?: "cancel" | "default" | "destructive";
    }[] = [];

    // Always offer in-app messaging first (privacy-preserving)
    options.push({
      text: "💬 Send In-App Message",
      onPress: handleStartConversation,
    });

    // Only show direct contact as fallback if they explicitly prefer it
    if (
      contactPreference !== "in_app" &&
      hasPhone &&
      (contactPreference === "phone" || contactPreference === "any")
    ) {
      options.push({
        text: `📱 Text: ${contactPhone}`,
        onPress: () => handleContact("sms"),
      });
      options.push({
        text: `📞 Call: ${contactPhone}`,
        onPress: () => handleContact("phone"),
      });
    }

    if (
      contactPreference !== "in_app" &&
      hasEmail &&
      (contactPreference === "email" || contactPreference === "any")
    ) {
      options.push({
        text: `✉️ Email: ${contactEmail}`,
        onPress: () => handleContact("email"),
      });
    }

    options.push({ text: "Cancel", style: "cancel" });

    showAlert(
      currentPost.type === "request" ? "Offer Help" : "Accept Offer",
      "In-app messaging protects your privacy. How would you like to reach out?",
      options,
    );
  };

  const handleMarkFulfilled = async () => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showConfirmAlert(
      "Mark as Fulfilled",
      "Are you sure you want to mark this post as fulfilled?",
      async () => {
        try {
          const updated = await updateMutation.mutateAsync({
            id: currentPost.id,
            userId: user.id,
            updates: { status: "fulfilled" },
          });
          setCurrentPost(updated);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          toast.success(
            "Post fulfilled",
            "Thank you for helping your community!",
          );
        } catch (error) {
          toast.error(
            "Error",
            getErrorMessage(error) || "Failed to update post.",
          );
        }
      },
      "Yes, Mark Fulfilled",
    );
  };

  const handleDeletePost = async () => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showConfirmAlert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      async () => {
        try {
          await deleteMutation.mutateAsync({
            id: currentPost.id,
            userId: user.id,
          });
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          toast.success("Post deleted");
          navigation.goBack();
        } catch (error) {
          toast.error(
            "Error",
            getErrorMessage(error) || "Failed to delete post.",
          );
        }
      },
      "Delete",
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
              style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}
            >
              <Feather name="user" size={20} color={theme.primary} />
            </View>
            <View>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {currentPost.authorDisplayName || "Community Member"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                1 Sadaqa
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
            <ThemedText style={[styles.contactText, { color: theme.primary }]}>
              {getContactPreferenceLabel(currentPost.contactPreference)}
            </ThemedText>
          </View>
        </View>

        {/* Location Section */}
        {(currentPost.city || currentPost.state || currentPost.zipCode) && (
          <View style={styles.infoSection}>
            <ThemedText
              type="small"
              style={[styles.contactLabel, { color: theme.textSecondary }]}
            >
              Location
            </ThemedText>
            <View
              style={[
                styles.contactBadge,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="map-pin" size={16} color={theme.primary} />
              <ThemedText style={styles.infoText}>
                {formatLocation({
                  city: currentPost.city,
                  state: currentPost.state,
                  zipCode: currentPost.zipCode,
                })}
                {currentPost.distance !== undefined && (
                  <ThemedText style={{ color: theme.textSecondary }}>
                    {" "}• {formatDistance(currentPost.distance)} away
                  </ThemedText>
                )}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Exchange Type Section */}
        {currentPost.exchangeType && (
          <View style={styles.infoSection}>
            <ThemedText
              type="small"
              style={[styles.contactLabel, { color: theme.textSecondary }]}
            >
              Type of Help
            </ThemedText>
            <View
              style={[
                styles.contactBadge,
                {
                  backgroundColor:
                    currentPost.exchangeType === "money"
                      ? theme.accent + "20"
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name={
                  currentPost.exchangeType === "goods"
                    ? "package"
                    : currentPost.exchangeType === "service"
                      ? "heart"
                      : currentPost.exchangeType === "money"
                        ? "dollar-sign"
                        : "gift"
                }
                size={16}
                color={
                  currentPost.exchangeType === "money" ? "#B8860B" : theme.primary
                }
              />
              <ThemedText
                style={[
                  styles.infoText,
                  currentPost.exchangeType === "money" && { color: "#B8860B" },
                ]}
              >
                {getExchangeTypeLabel(currentPost.exchangeType)}
              </ThemedText>
            </View>
            {currentPost.exchangeNotes && (
              <ThemedText
                type="small"
                style={[styles.exchangeNotes, { color: theme.textSecondary }]}
              >
                {currentPost.exchangeNotes}
              </ThemedText>
            )}
          </View>
        )}

        {!isOwner && currentPost.status === "open" ? (
          <Pressable style={[styles.reportButton]} onPress={handleReport} accessibilityRole="button">
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
            <View style={styles.ownerActions}>
              <Button
                onPress={handleMarkFulfilled}
                style={styles.primaryActionButton}
              >
                Mark as Fulfilled
              </Button>
              <Pressable
                onPress={handleDeletePost}
                accessibilityRole="button"
                accessibilityLabel="Delete"
                style={[styles.deleteButton, { borderColor: theme.urgent }]}
              >
                <Feather name="trash-2" size={18} color={theme.urgent} />
              </Pressable>
            </View>
          ) : (
            <Button onPress={handleOfferHelp} style={styles.actionButton}>
              {currentPost.type === "request" ? "Offer Help" : "I Need This"}
            </Button>
          )}
        </View>
      ) : isOwner ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.backgroundRoot,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          <Pressable
            onPress={handleDeletePost}
            accessibilityRole="button"
            style={[styles.deleteTextButton]}
          >
            <Feather name="trash-2" size={16} color={theme.urgent} />
            <ThemedText style={[styles.deleteText, { color: theme.urgent }]}>
              Delete Post
            </ThemedText>
          </Pressable>
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
  infoSection: {
    marginBottom: Spacing["2xl"],
  },
  infoText: {
    marginLeft: Spacing.sm,
  },
  exchangeNotes: {
    marginTop: Spacing.sm,
    lineHeight: 18,
    fontStyle: "italic",
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
  ownerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  primaryActionButton: {
    flex: 1,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  deleteText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
});
