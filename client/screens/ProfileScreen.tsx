import React from "react";
import { View, StyleSheet, Pressable, Alert, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post, UserProfile } from "@/types/post";
import { getUser, getPosts, clearAllData, saveUser } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);

      if (currentUser) {
        const allPosts = await getPosts();
        const userPosts = allPosts.filter((p) => p.authorId === currentUser.id);
        setMyPosts(userPosts);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleEditName = () => {
    Alert.prompt(
      "Edit Display Name",
      "Enter your name as it will appear to the community",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (newName) => {
            if (newName && newName.trim() && user) {
              const updatedUser = { ...user, displayName: newName.trim() };
              await saveUser(updatedUser);
              setUser(updatedUser);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      "plain-text",
      user?.displayName || ""
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all your posts and reset the app. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setUser(null);
            setMyPosts([]);
            Alert.alert("Data Cleared", "Please restart the app.");
          },
        },
      ]
    );
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate("PostDetail", { post });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View
        style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}
      >
        <Feather name="user" size={32} color={theme.primary} />
      </View>

      <Pressable onPress={handleEditName} style={styles.nameContainer}>
        <ThemedText type="h2">{user?.displayName || "Community Member"}</ThemedText>
        <Feather name="edit-2" size={16} color={theme.textTertiary} style={styles.editIcon} />
      </Pressable>

      <View
        style={[
          styles.communityBadge,
          { backgroundColor: theme.primary + "15" },
        ]}
      >
        <Feather name="map-pin" size={14} color={theme.primary} />
        <ThemedText style={[styles.communityText, { color: theme.primary }]}>
          IOK Diamond Bar
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
          icon="trash-2"
          label="Clear All Data"
          onPress={handleClearData}
          theme={theme}
          danger
        />
      </View>

      <View style={styles.postsSection}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          My Posts
        </ThemedText>
      </View>
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

  const renderEmpty = () => (
    <EmptyState
      title="No posts yet"
      description="Create a request or offer to help your community"
      actionLabel="Create Post"
      onAction={() => navigation.navigate("CreatePost")}
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]} />
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
          { backgroundColor: danger ? theme.urgent + "15" : theme.backgroundTertiary },
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
    marginBottom: Spacing.sm,
  },
  editIcon: {
    marginLeft: Spacing.sm,
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
});
