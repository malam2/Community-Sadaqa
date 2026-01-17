import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import CreatePostScreen from "@/screens/CreatePostScreen";
import PreviewPostScreen from "@/screens/PreviewPostScreen";
import SuccessScreen from "@/screens/SuccessScreen";
import PostDetailScreen from "@/screens/PostDetailScreen";
import ReportScreen from "@/screens/ReportScreen";
import GuidelinesScreen from "@/screens/GuidelinesScreen";
import PrivacyScreen from "@/screens/PrivacyScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Post, PostType, PostCategory, ContactPreference } from "@/types/post";

export type RootStackParamList = {
  Main: undefined;
  CreatePost: undefined;
  PreviewPost: {
    postData: {
      type: PostType;
      category: PostCategory;
      title: string;
      description: string;
      isUrgent: boolean;
      isAnonymous: boolean;
      contactPreference: ContactPreference;
    };
  };
  Success: {
    type: PostType;
  };
  PostDetail: {
    post: Post;
  };
  Report: {
    postId: string;
  };
  Guidelines: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          headerTitle: "New Post",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="PreviewPost"
        component={PreviewPostScreen}
        options={{
          headerTitle: "Preview",
        }}
      />
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerTitle: "",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Report"
        component={ReportScreen}
        options={{
          headerTitle: "Report",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Guidelines"
        component={GuidelinesScreen}
        options={{
          headerTitle: "Guidelines",
        }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          headerTitle: "Privacy",
        }}
      />
    </Stack.Navigator>
  );
}
