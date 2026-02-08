import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { showAlert } from "@/lib/alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText, PostCard, Button, toast } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePostMutation } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/errorUtils";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post } from "@/types/post";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type PreviewPostRouteProp = RouteProp<RootStackParamList, "PreviewPost">;

export default function PreviewPostScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PreviewPostRouteProp>();
  const { user } = useAuth();

  const { postData } = route.params;
  const createMutation = useCreatePostMutation();

  const previewPost: Post = {
    id: "preview",
    communityId: "local_ummah",
    type: postData.type,
    category: postData.category,
    title: postData.title,
    description: postData.description,
    isAnonymous: postData.isAnonymous,
    authorId: "",
    authorDisplayName: postData.isAnonymous
      ? undefined
      : user?.displayName || "You",
    createdAt: Date.now(),
    status: "open",
    urgent: postData.isUrgent,
    contactPreference: postData.contactPreference,
    contactPhone: postData.contactPhone,
    contactEmail: postData.contactEmail,
  };

  const handlePublish = async () => {
    if (!user) {
      showAlert("Error", "Please log in to create a post.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        userId: user.id,
        data: {
          type: postData.type,
          category: postData.category,
          title: postData.title,
          description: postData.description,
          isAnonymous: postData.isAnonymous,
          urgent: postData.isUrgent,
          contactPreference: postData.contactPreference,
          contactPhone: postData.contactPhone,
          contactEmail: postData.contactEmail,
          // Location fields
          city: postData.city,
          state: postData.state,
          zipCode: postData.zipCode,
          latitude: postData.latitude,
          longitude: postData.longitude,
          // Exchange type
          exchangeType: postData.exchangeType,
          exchangeNotes: postData.exchangeNotes,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Success", { type: postData.type });
    } catch (error) {
      toast.error(
        "Failed to publish",
        getErrorMessage(error) || "Please try again.",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
        <ThemedText type="h3" style={styles.sectionTitle}>
          Preview
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.sectionDescription, { color: theme.textSecondary }]}
        >
          This is how your post will appear to the community
        </ThemedText>

        <View style={styles.previewCard}>
          <PostCard post={previewPost} onPress={() => {}} />
        </View>

        <View
          style={[
            styles.detailsCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="h4" style={styles.detailsTitle}>
            Full Description
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.detailsText, { color: theme.textSecondary }]}
          >
            {postData.description}
          </ThemedText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <Button
          onPress={handlePublish}
          disabled={createMutation.isPending}
          style={styles.publishButton}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            "Publish Post"
          )}
        </Button>
      </View>
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
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    marginBottom: Spacing["2xl"],
  },
  previewCard: {
    marginBottom: Spacing["2xl"],
  },
  detailsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  detailsTitle: {
    marginBottom: Spacing.sm,
  },
  detailsText: {
    lineHeight: 24,
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
  publishButton: {
    width: "100%",
  },
});
