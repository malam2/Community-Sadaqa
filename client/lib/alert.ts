import { Alert, Platform } from "react-native";

type AlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

/**
 * Cross-platform alert that works on both web and native.
 * On web, uses window.confirm/alert since React Native's Alert doesn't work properly.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS === "web") {
    // Handle web platform
    const fullMessage = message ? `${title}\n\n${message}` : title;

    if (!buttons || buttons.length === 0) {
      // Simple alert with no buttons - just show an alert
      window.alert(fullMessage);
      return;
    }

    if (buttons.length === 1) {
      // Single button - show alert and call the callback
      window.alert(fullMessage);
      buttons[0].onPress?.();
      return;
    }

    // Two or more buttons - use confirm
    // Find cancel and confirm buttons
    const cancelButton = buttons.find((b) => b.style === "cancel");
    const confirmButton = buttons.find((b) => b.style !== "cancel");

    if (window.confirm(fullMessage)) {
      // User clicked OK - trigger the confirm action
      confirmButton?.onPress?.();
    } else {
      // User clicked Cancel
      cancelButton?.onPress?.();
    }
  } else {
    // Native platform - use React Native's Alert
    Alert.alert(title, message, buttons);
  }
}

/**
 * Show a confirmation dialog.
 * Returns true if confirmed, false if cancelled (for async usage).
 */
export function showConfirmAlert(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmText: string = "OK",
  cancelText: string = "Cancel",
): void {
  showAlert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}

/**
 * Show a simple informational alert.
 */
export function showInfoAlert(
  title: string,
  message?: string,
  onDismiss?: () => void,
): void {
  showAlert(title, message, [{ text: "OK", onPress: onDismiss }]);
}
