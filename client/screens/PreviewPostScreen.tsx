import React from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post, PostCategory, ContactPreference, PostType } from "@/types/post";
import { savePost, getUser } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type PreviewPostRouteProp = RouteProp<RootStackParamList, "PreviewPost">;

export default function PreviewPostScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PreviewPostRouteProp>();

  const { postData } = route.params;
  const [isPublishing, setIsPublishing] = React.useState(false);

  const previewPost: Post = {
    id: "preview",
    communityId: "iok_diamond_bar",
    type: postData.type,
    category: postData.category,
    title: postData.title,
    description: postData.description,
    isAnonymous: postData.isAnonymous,
    authorId: "",
    authorDisplayName: postData.isAnonymous ? undefined : "You",
    createdAt: Date.now(),
    status: "open",
    urgent: postData.isUrgent,
    contactPreference: postData.contactPreference,
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const user = await getUser();
      if (!user) {
        Alert.alert("Error", "Please try again.");
        setIsPublishing(false);
        return;
      }

      await savePost({
        communityId: "iok_diamond_bar",
        type: postData.type,
        category: postData.category,
        title: postData.title,
        description: postData.description,
        isAnonymous: postData.isAnonymous,
        authorId: user.id,
        authorDisplayName: postData.isAnonymous ? undefined : user.displayName,
        status: "open",
        urgent: postData.isUrgent,
        contactPreference: postData.contactPreference,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Success", { type: postData.type });
    } catch (error) {
      Alert.alert("Error", "Failed to publish post. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsPublishing(false);
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
          disabled={isPublishing}
          style={styles.publishButton}
        >
          {isPublishing ? (
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
