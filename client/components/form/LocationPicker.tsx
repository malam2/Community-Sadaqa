import React from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/primitives/ThemedText";
import { FormInput } from "@/components/form/FormInput";
import { Dropdown } from "@/components/form/Dropdown";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import {
  UserLocation,
  US_STATES,
  RADIUS_OPTIONS,
  DEFAULT_RADIUS,
  formatLocation,
  isValidZipCode,
} from "@/types/location";

interface LocationPickerProps {
  value: UserLocation;
  onChange: (location: UserLocation) => void;
  showRadius?: boolean;
  label?: string;
  error?: string;
}

export function LocationPicker({
  value,
  onChange,
  showRadius = false,
  label = "Location",
  error,
}: LocationPickerProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [manualEntry, setManualEntry] = React.useState(false);

  const hasLocation = value.latitude !== undefined && value.longitude !== undefined;

  const handleUseCurrentLocation = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location permissions in your device settings to use this feature.",
          [{ text: "OK" }],
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city/state
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      onChange({
        ...value,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: address?.city ?? undefined,
        state: address?.region ?? undefined,
        zipCode: address?.postalCode ?? undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Location error:", err);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again or enter your location manually.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipCodeChange = (zip: string) => {
    onChange({
      ...value,
      zipCode: zip,
    });
  };

  const handleCityChange = (city: string) => {
    onChange({
      ...value,
      city,
    });
  };

  const handleStateChange = (state: string | null) => {
    onChange({
      ...value,
      state: state ?? undefined,
    });
  };

  const handleRadiusChange = (radius: number | null) => {
    onChange({
      ...value,
      locationRadius: radius ?? DEFAULT_RADIUS,
    });
  };

  const handleClearLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({
      locationRadius: value.locationRadius,
    });
    setManualEntry(false);
  };

  const displayLocation = formatLocation(value);

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: theme.textSecondary }]}
      >
        {label}
      </ThemedText>

      {hasLocation && !manualEntry ? (
        // Show current location with edit/clear options
        <View
          style={[
            styles.locationDisplay,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.locationInfo}>
            <Feather
              name="map-pin"
              size={18}
              color={theme.primary}
              style={styles.locationIcon}
            />
            <ThemedText style={styles.locationText}>
              {displayLocation || "Location set"}
            </ThemedText>
          </View>
          <View style={styles.locationActions}>
            <Pressable
              onPress={() => setManualEntry(true)}
              style={styles.actionButton}
            >
              <Feather name="edit-2" size={16} color={theme.textSecondary} />
            </Pressable>
            <Pressable onPress={handleClearLocation} style={styles.actionButton}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>
      ) : (
        // Location input options
        <View style={styles.inputContainer}>
          {/* Use Current Location Button */}
          <Pressable
            onPress={handleUseCurrentLocation}
            disabled={isLoading}
            style={[
              styles.useLocationButton,
              {
                backgroundColor: theme.primary + "15",
                borderColor: theme.primary,
              },
            ]}
          >
            <Feather
              name={isLoading ? "loader" : "navigation"}
              size={18}
              color={theme.primary}
            />
            <ThemedText style={[styles.useLocationText, { color: theme.primary }]}>
              {isLoading ? "Getting location..." : "Use Current Location"}
            </ThemedText>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ThemedText
              type="small"
              style={[styles.dividerText, { color: theme.textTertiary }]}
            >
              or enter manually
            </ThemedText>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          {/* Manual Entry */}
          <FormInput
            label="City"
            value={value.city ?? ""}
            onChangeText={handleCityChange}
            placeholder="Enter your city"
          />

          <Dropdown
            label="State"
            options={US_STATES}
            value={value.state ?? null}
            onChange={handleStateChange}
            placeholder="Select state"
          />

          <FormInput
            label="ZIP Code"
            value={value.zipCode ?? ""}
            onChangeText={handleZipCodeChange}
            placeholder="Enter ZIP code"
            keyboardType="number-pad"
            maxLength={10}
            error={
              value.zipCode && !isValidZipCode(value.zipCode)
                ? "Please enter a valid ZIP code"
                : undefined
            }
          />

          {manualEntry && hasLocation && (
            <Pressable
              onPress={() => setManualEntry(false)}
              style={styles.cancelButton}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
            </Pressable>
          )}
        </View>
      )}

      {/* Radius Selector */}
      {showRadius && (
        <View style={styles.radiusContainer}>
          <ThemedText style={[styles.radiusLabel, { color: theme.textSecondary }]}>
            Show posts within
          </ThemedText>
          <View style={styles.radiusOptions}>
            {RADIUS_OPTIONS.map((option) => {
              const isSelected = (value.locationRadius ?? DEFAULT_RADIUS) === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.radiusOption,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.backgroundSecondary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleRadiusChange(option.value)}
                >
                  <ThemedText
                    style={{
                      color: isSelected ? "#FFFFFF" : theme.text,
                      fontSize: 13,
                      fontWeight: isSelected ? "600" : "400",
                    }}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {error ? (
        <ThemedText style={[styles.error, { color: theme.urgent }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  useLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  useLocationText: {
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
  },
  locationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationIcon: {
    marginRight: Spacing.sm,
  },
  locationText: {
    flex: 1,
  },
  locationActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  radiusContainer: {
    marginTop: Spacing.lg,
  },
  radiusLabel: {
    marginBottom: Spacing.sm,
    fontSize: 14,
  },
  radiusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  radiusOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: Spacing.sm,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});
