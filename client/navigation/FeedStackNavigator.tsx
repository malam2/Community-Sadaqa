import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FeedScreen from "@/screens/FeedScreen";
import { HeaderTitle } from "@/components";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type FeedStackParamList = {
  Feed: undefined;
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          headerTitle: () => (
            <HeaderTitle title="One Ummah" subtitle="Community Aid" />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
