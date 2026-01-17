import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#666666",
    textTertiary: "#999999",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#2D8659",
    link: "#2D8659",
    primary: "#2D8659",
    primaryVariant: "#1F5D3D",
    urgent: "#D84315",
    success: "#2D8659",
    anonymous: "#5E35B1",
    accent: "#FFB74D",
    backgroundRoot: "#FAFAF8",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F5F5F3",
    backgroundTertiary: "#EEEEEC",
    border: "#E5E5E3",
    cardShadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#A0A0A0",
    textTertiary: "#707070",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#4CAF7A",
    link: "#4CAF7A",
    primary: "#4CAF7A",
    primaryVariant: "#2D8659",
    urgent: "#FF7043",
    success: "#4CAF7A",
    anonymous: "#9575CD",
    accent: "#FFB74D",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#242424",
    backgroundSecondary: "#2E2E2E",
    backgroundTertiary: "#383838",
    border: "#3A3A3A",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
