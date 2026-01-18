import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText, Badge, EmptyState } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { fetchUserConversations } from "@/lib/api";
import {
  Conversation,
  getConversationStatusLabel,
  getConversationStatusColor,
} from "@/types/conversation";
import { getTimeAgo } from "@/types/post";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function ConversationsListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const data = await fetchUserConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = (conversation: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Conversation" as any, {
      conversationId: conversation.id,
      postTitle: conversation.postTitle || "Conversation",
    });
  };

  const renderConversation = ({
    item,
    index,
  }: {
    item: Conversation;
    index: number;
  }) => {
    const statusColor = getConversationStatusColor(item.status);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => handleConversationPress(item)}
          style={[
            styles.conversationCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <View
                style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}
              >
                <Feather name="message-circle" size={20} color={theme.primary} />
              </View>
              {item.unreadCount && item.unreadCount > 0 ? (
                <View style={[styles.unreadBadge, { backgroundColor: theme.urgent }]}>
                  <ThemedText style={styles.unreadText}>
                    {item.unreadCount > 9 ? "9+" : item.unreadCount}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <ThemedText style={styles.participantName} numberOfLines={1}>
                  {item.otherParticipantName}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.time, { color: theme.textTertiary }]}
                >
                  {getTimeAgo(item.updatedAt)}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                style={[styles.postTitle, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                Re: {item.postTitle || "Post"}
              </ThemedText>
              {item.lastMessage ? (
                <ThemedText
                  type="small"
                  style={[
                    styles.lastMessage,
                    {
                      color: item.unreadCount
                        ? theme.text
                        : theme.textSecondary,
                      fontWeight: item.unreadCount ? "600" : "400",
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.lastMessage.isFromMe ? "You: " : ""}
                  {item.lastMessage.content}
                </ThemedText>
              ) : (
                <ThemedText
                  type="small"
                  style={[styles.lastMessage, { color: theme.textTertiary }]}
                >
                  No messages yet
                </ThemedText>
              )}
            </View>
          </View>

          {/* Status and Meeting Info */}
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <ThemedText
                type="small"
                style={[styles.statusText, { color: statusColor }]}
              >
                {getConversationStatusLabel(item.status)}
              </ThemedText>
            </View>

            {item.meetingLocation && (
              <View style={styles.meetingInfo}>
                <Feather name="map-pin" size={12} color={theme.primary} />
                <ThemedText
                  type="small"
                  style={[styles.meetingText, { color: theme.primary }]}
                >
                  {item.meetingLocation}
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Conversations Yet"
            description="When you reach out about a post or someone contacts you, your conversations will appear here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  conversationCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantName: {
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    fontSize: 12,
  },
  postTitle: {
    marginTop: 2,
  },
  lastMessage: {
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontWeight: "500",
    fontSize: 11,
  },
  meetingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  meetingText: {
    fontWeight: "500",
  },
});
