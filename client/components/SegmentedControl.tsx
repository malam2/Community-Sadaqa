import React from "react";
import { View, StyleSheet, Pressable, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  const { theme } = useTheme();
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = useSharedValue(0);

  const segmentWidth = containerWidth / options.length;
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  React.useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withSpring(selectedIndex * segmentWidth, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [selectedIndex, segmentWidth, containerWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth - Spacing.xs * 2,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (optionValue: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(optionValue);
  };

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: theme.backgroundDefault },
          animatedIndicatorStyle,
        ]}
      />
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={styles.segment}
          onPress={() => handlePress(option.value)}
        >
          <ThemedText
            type="body"
            style={[
              styles.label,
              {
                color: value === option.value ? theme.primary : theme.textSecondary,
                fontWeight: value === option.value ? "600" : "400",
              },
            ]}
          >
            {option.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: Spacing.xs,
    left: Spacing.xs,
    bottom: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    zIndex: 1,
  },
  label: {
    textAlign: "center",
  },
});
