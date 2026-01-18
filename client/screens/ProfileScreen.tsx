import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  FlatList,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import {
  ThemedText,
  PostCard,
  EmptyState,
  Button,
  SkeletonFeed,
  SkeletonProfileHeader,
  toast,
} from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPostsQuery } from "@/hooks/queries";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post } from "@/types/post";
import { updateDisplayName } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errorUtils";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, setUser, logout, isGuest } = useAuth();

  // React Query for posts
  const { data: myPosts = [], isLoading } = useUserPostsQuery(
    !isGuest ? user?.id : undefined,
  );

  const [showNameModal, setShowNameModal] = React.useState(false);
  const [newDisplayName, setNewDisplayName] = React.useState("");
  const [isSavingName, setIsSavingName] = React.useState(false);

  const handleEditName = () => {
    if (!user || isGuest) return;
    setNewDisplayName(user.displayName);
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    if (!user || !newDisplayName.trim()) return;

    setIsSavingName(true);
    try {
      const updated = await updateDisplayName(user.id, newDisplayName.trim());
      setUser(updated);
      setShowNameModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success("Name updated", "Your display name has been changed.");
    } catch (error) {
      toast.error("Error", getErrorMessage(error) || "Failed to update name.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate("PostDetail", { post });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
        <Feather name="user" size={32} color={theme.primary} />
      </View>

      {isGuest ? (
        <>
          <ThemedText type="h2">Guest</ThemedText>
          <ThemedText
            type="small"
            style={[styles.emailText, { color: theme.textSecondary }]}
          >
            Sign up to save your posts and preferences
          </ThemedText>
          <Button onPress={() => logout()} style={styles.signUpButton}>
            Create Account
          </Button>
        </>
      ) : (
        <>
          <Pressable onPress={handleEditName} style={styles.nameContainer}>
            <ThemedText type="h2">
              {user?.displayName || "Community Member"}
            </ThemedText>
            <Feather
              name="edit-2"
              size={16}
              color={theme.textTertiary}
              style={styles.editIcon}
            />
          </Pressable>

          <ThemedText
            type="small"
            style={[styles.emailText, { color: theme.textSecondary }]}
          >
            {user?.email}
          </ThemedText>
        </>
      )}

      <View
        style={[
          styles.communityBadge,
          { backgroundColor: theme.primary + "15" },
        ]}
      >
        <Feather name="map-pin" size={14} color={theme.primary} />
        <ThemedText style={[styles.communityText, { color: theme.primary }]}>
          Local Ummah
        </ThemedText>
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="book-open"
          label="Community Guidelines"
          onPress={() => navigation.navigate("Guidelines")}
          theme={theme}
        />
        <MenuItem
          icon="shield"
          label="Privacy Policy"
          onPress={() => navigation.navigate("Privacy")}
          theme={theme}
        />
        <MenuItem
          icon="log-out"
          label={isGuest ? "Exit Guest Mode" : "Sign Out"}
          onPress={handleLogout}
          theme={theme}
          danger
        />
      </View>

      {!isGuest && (
        <View style={styles.postsSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            My Posts
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <PostCard
        post={item}
        onPress={() => handlePostPress(item)}
        testID={`my-post-${item.id}`}
      />
    </Animated.View>
  );

  const renderEmpty = () =>
    isGuest ? null : (
      <EmptyState
        title="No posts yet"
        description="Create a request or offer to help your community"
        actionLabel="Create Post"
        onAction={() => navigation.navigate("CreatePost")}
      />
    );

  if (isLoading && !isGuest) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View
          style={{
            paddingTop: headerHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          }}
        >
          <SkeletonProfileHeader />
          <View style={{ marginTop: Spacing.xl }}>
            <SkeletonFeed count={2} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNameModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText type="h3" style={styles.modalTitle}>
              Edit Display Name
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.modalSubtitle, { color: theme.textSecondary }]}
            >
              Enter your name as it will appear to the community
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundRoot,
                  color: theme.text,
                  borderColor: theme.textTertiary,
                },
              ]}
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              placeholder="Your display name"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowNameModal(false)}
              >
                <ThemedText style={{ color: theme.textSecondary }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Button
                onPress={handleSaveName}
                disabled={!newDisplayName.trim() || isSavingName}
                style={styles.modalSaveButton}
              >
                {isSavingName ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  "Save"
                )}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  theme: any;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, theme, danger }: MenuItemProps) {
  return (
    <Pressable
      style={[styles.menuItem, { backgroundColor: theme.backgroundSecondary }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: danger
              ? theme.urgent + "15"
              : theme.backgroundTertiary,
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? theme.urgent : theme.textSecondary}
        />
      </View>
      <ThemedText
        style={[
          styles.menuLabel,
          { color: danger ? theme.urgent : theme.text },
        ]}
      >
        {label}
      </ThemedText>
      <Feather name="chevron-right" size={20} color={theme.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  editIcon: {
    marginLeft: Spacing.sm,
  },
  emailText: {
    marginBottom: Spacing.md,
  },
  communityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing["2xl"],
  },
  communityText: {
    marginLeft: Spacing.xs,
    fontWeight: "500",
    fontSize: 14,
  },
  menuSection: {
    width: "100%",
    marginBottom: Spacing["2xl"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  postsSection: {
    width: "100%",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  signUpButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  modalTitle: {
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    marginBottom: Spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
  },
  modalCancelButton: {
    backgroundColor: "transparent",
  },
  modalSaveButton: {
    flex: 1,
  },
});
