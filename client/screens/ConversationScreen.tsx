import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { showAlert, showInfoAlert } from "@/lib/alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText, Button, toast } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  fetchConversationMessages,
  sendMessage as sendMessageApi,
  fetchMeetingInfo,
  setMeetingDetails,
} from "@/lib/api";
import { Message, MeetingInfo } from "@/types/conversation";
import { getTimeAgo } from "@/types/post";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type ConversationRouteProp = RouteProp<RootStackParamList, "Conversation">;

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ConversationRouteProp>();
  const { user } = useAuth();

  const { conversationId, postTitle } = route.params;

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [meetingInfo, setMeetingInfo] = React.useState<MeetingInfo | null>(null);
  const [showMeetingPicker, setShowMeetingPicker] = React.useState(false);

  const flatListRef = React.useRef<FlatList>(null);

  // Load messages
  React.useEffect(() => {
    loadMessages();
    loadMeetingInfo();

    // Poll for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      const data = await fetchConversationMessages(conversationId, user.id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeetingInfo = async () => {
    try {
      const info = await fetchMeetingInfo();
      setMeetingInfo(info);
    } catch (error) {
      console.error("Failed to load meeting info:", error);
    }
  };

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSending(true);

    try {
      const message = await sendMessageApi(conversationId, user.id, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      toast.error("Error", "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSetMeeting = () => {
    if (!meetingInfo) return;

    // Show meeting place picker - use a simpler approach for web compatibility
    if (Platform.OS === "web") {
      const place = window.prompt(
        "Choose a meeting location:\n\n" +
          meetingInfo.suggestedPlaces.join("\n") +
          "\n\nEnter location:",
        meetingInfo.suggestedPlaces[0],
      );
      if (place) {
        confirmMeetingLocation(place);
      }
    } else {
      const options = meetingInfo.suggestedPlaces.map((place) => ({
        text: place,
        onPress: () => confirmMeetingLocation(place),
      }));

      options.push({ text: "Cancel", style: "cancel" } as any);

      showAlert(
        "Set Meeting Location",
        "Choose a safe, public place to meet:",
        options.slice(0, 8),
      );
    }
  };

  const confirmMeetingLocation = async (location: string) => {
    if (!user) return;

    try {
      await setMeetingDetails(conversationId, user.id, {
        location,
      });
      toast.success("Meeting Set", `Meeting location set to: ${location}`);
      
      // Send a system-like message about the meeting
      await sendMessageApi(
        conversationId,
        user.id,
        `📍 I've suggested we meet at: ${location}`,
      );
      loadMessages();
    } catch (error) {
      toast.error("Error", "Failed to set meeting location.");
    }
  };

  const handleShowSafetyTips = () => {
    if (!meetingInfo) return;

    showInfoAlert(
      "Safety Tips for Meetups",
      meetingInfo.safetyTips.join("\n\n"),
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isFromMe = item.isFromMe;

    return (
      <View
        style={[
          styles.messageContainer,
          isFromMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isFromMe
                ? theme.primary
                : theme.backgroundSecondary,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              { color: isFromMe ? "#FFFFFF" : theme.text },
            ]}
          >
            {item.content}
          </ThemedText>
        </View>
        <ThemedText
          type="small"
          style={[styles.messageTime, { color: theme.textTertiary }]}
        >
          {getTimeAgo(item.createdAt)}
        </ThemedText>
      </View>
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {/* Header Info */}
      <View
        style={[styles.headerInfo, { backgroundColor: theme.backgroundSecondary }]}
      >
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Regarding:
        </ThemedText>
        <ThemedText style={styles.postTitle} numberOfLines={1}>
          {postTitle}
        </ThemedText>
        <Pressable onPress={handleShowSafetyTips} style={styles.safetyButton}>
          <Feather name="shield" size={14} color={theme.primary} />
          <ThemedText
            type="small"
            style={[styles.safetyText, { color: theme.primary }]}
          >
            Safety Tips
          </ThemedText>
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: Spacing.lg },
        ]}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={48} color={theme.textTertiary} />
            <ThemedText
              type="body"
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              Start the conversation!
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.emptySubtext, { color: theme.textTertiary }]}
            >
              Your privacy is protected. Messages are exchanged through our secure
              system.
            </ThemedText>
          </View>
        }
      />

      {/* Set Meeting Button */}
      <Pressable
        onPress={handleSetMeeting}
        style={[styles.meetingButton, { borderColor: theme.primary }]}
      >
        <Feather name="map-pin" size={16} color={theme.primary} />
        <ThemedText style={[styles.meetingButtonText, { color: theme.primary }]}>
          Set Meeting Location
        </ThemedText>
      </Pressable>

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundSecondary,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundRoot,
              color: theme.text,
            },
          ]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.textTertiary}
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={handleSend}
          disabled={isSending || !newMessage.trim()}
          style={[
            styles.sendButton,
            {
              backgroundColor:
                newMessage.trim() && !isSending
                  ? theme.primary
                  : theme.textTertiary,
            },
          ]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  postTitle: {
    flex: 1,
    fontWeight: "600",
  },
  safetyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  safetyText: {
    fontWeight: "500",
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  messageContainer: {
    marginBottom: Spacing.md,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing["4xl"],
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: Spacing.sm,
    textAlign: "center",
    paddingHorizontal: Spacing["2xl"],
    lineHeight: 18,
  },
  meetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  meetingButtonText: {
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
